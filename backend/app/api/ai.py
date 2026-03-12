from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import httpx
import xml.etree.ElementTree as ET
import re
from app.db.database import get_db
from app.models.ai import NewsSource, NewsSourceType
from app.models.article import Article
from app.models.user import User
from app.schemas.ai import (
    NewsSourceCreate, NewsSourceUpdate, NewsSourceResponse,
    AISuggestionRequest, AIPreviewResponse, NewsCandidate,
    AIArticleGenerateRequest, AIArticleGenerateResponse
)
from app.core.security import get_current_user
from google import genai
from google.genai import types

router = APIRouter()

# --- News Source Management ---

@router.post("/sources", response_model=NewsSourceResponse)
def create_news_source(source: NewsSourceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    db_source = NewsSource(**source.model_dump())
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source

@router.get("/sources", response_model=List[NewsSourceResponse])
def list_news_sources(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(NewsSource).all()

@router.put("/sources/{source_id}", response_model=NewsSourceResponse)
def update_news_source(source_id: int, source_update: NewsSourceUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    db_source = db.query(NewsSource).filter(NewsSource.id == source_id).first()
    if not db_source:
        raise HTTPException(status_code=404, detail="Source not found")
    
    for field, value in source_update.model_dump(exclude_unset=True).items():
        setattr(db_source, field, value)
    
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source

@router.delete("/sources/{source_id}")
def delete_news_source(source_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    db_source = db.query(NewsSource).filter(NewsSource.id == source_id).first()
    if not db_source:
        raise HTTPException(status_code=404, detail="Source not found")
    db.delete(db_source)
    db.commit()
    return {"detail": "Source deleted"}

# --- AI Intelligence Endpoints ---

async def fetch_rss_candidates(url: str, source_name: str, category: str):
    candidates = []
    try:
        async with httpx.AsyncClient(follow_redirects=True, verify=False) as client:
            response = await client.get(url, timeout=10.0)
            if response.status_code == 200:
                # Some feeds have encoding issues, let's try to parse safely
                content = response.text
                # Remove common problematic prefixes if any
                content = content.strip()
                
                try:
                    root = ET.fromstring(content)
                except ET.ParseError:
                    # Try binary if text fails
                    root = ET.fromstring(response.content)

                channel = root.find("channel")
                if channel is None: return []
                
                items = channel.findall("item")[:10] # Increase search space
                for item in items:
                    title_elem = item.find("title")
                    link_elem = item.find("link")
                    pub_elem = item.find("pubDate")
                    
                    title = title_elem.text.strip() if title_elem is not None and title_elem.text else ""
                    link = link_elem.text.strip() if link_elem is not None and link_elem.text else ""
                    pub_date = pub_elem.text.strip() if pub_elem is not None and pub_elem.text else ""
                    
                    # Try to find an image in standard RSS tags
                    image_url = None
                    enclosure = item.find("enclosure")
                    if enclosure is not None:
                        image_url = enclosure.get("url")
                    
                    if not image_url:
                         # Try media:content or media:thumbnail (namespaced)
                         for media_tag in ["{http://search.yahoo.com/mrss/}content", "{http://search.yahoo.com/mrss/}thumbnail"]:
                             media = item.find(media_tag)
                             if media is not None:
                                 image_url = media.get("url")
                                 break

                    if title and link:
                        candidates.append(NewsCandidate(
                            title=title,
                            source_url=link,
                            original_published_at=pub_date,
                            source_name=source_name,
                            category=category,
                            image_url=image_url
                        ))
    except Exception as e:
        print(f"Error fetching suggestions from {url}: {e}")
    return candidates

@router.post("/suggest", response_model=AIPreviewResponse)
async def get_ai_suggestions(req: AISuggestionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Scrapes news sources and suggests news candidates.
    If a category is provided, it prioritizes sources for that category, 
    but falls back to all active sources if no category sources are found.
    """
    query = db.query(NewsSource).filter(NewsSource.is_active == True)
    
    if req.category:
        category_sources = query.filter(NewsSource.category == req.category).all()
        if category_sources:
            sources = category_sources
        else:
            # Fallback to all sources if none found for specified category
            sources = query.all()
    else:
        sources = query.all()

    all_candidates = []
    for source in sources:
        candidates = await fetch_rss_candidates(source.url, source.name, source.category)
        all_candidates.extend(candidates)
    
    # Filter out existing articles by title similarity (case-insensitive check)
    # Get last 100 articles for better check
    existing_titles = [a.title.strip().lower() for a in db.query(Article).order_by(Article.published_at.desc()).limit(100).all()]
    
    suggestions = []
    for c in all_candidates:
        c_title_lower = c.title.strip().lower()
        if c_title_lower not in existing_titles:
            # Also check if we already added this one in the same batch
            if not any(s.title.strip().lower() == c_title_lower for s in suggestions):
                suggestions.append(c)
    
    return {"suggestions": suggestions[:req.limit]}

@router.post("/generate", response_model=AIArticleGenerateResponse)
async def generate_article_with_ai(req: AIArticleGenerateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Uses the modern Google GenAI SDK and Gemini 3.1 Pro to rewrite news.
    """
    if not current_user.gemini_api_key:
        raise HTTPException(status_code=400, detail="Gemini API Key is not configured in your profile.")

    # 1. Fetch content and image from source URL
    content_to_rewrite = ""
    extracted_image_url = None
    try:
        async with httpx.AsyncClient(follow_redirects=True, verify=False) as client:
            resp = await client.get(req.source_url, timeout=15.0)
            if resp.status_code == 200:
                html = resp.text
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(html, 'html.parser')
                
                # Image Extraction
                from urllib.parse import urljoin
                
                # Try multiple common meta tags for images
                og_image = soup.find("meta", attrs={"property": "og:image"}) or soup.find("meta", attrs={"name": "og:image"})
                twitter_image = soup.find("meta", attrs={"name": "twitter:image"}) or soup.find("meta", attrs={"property": "twitter:image"})
                image_src = soup.find("link", attrs={"rel": "image_src"})
                
                raw_image_url = None
                if og_image:
                    raw_image_url = og_image.get("content")
                elif twitter_image:
                    raw_image_url = twitter_image.get("content")
                elif image_src:
                    raw_image_url = image_src.get("href")
                
                if raw_image_url:
                    # Convert relative to absolute URL
                    extracted_image_url = urljoin(req.source_url, raw_image_url)

                # Content Extraction
                for script in soup(["script", "style"]):
                    script.extract()
                content_to_rewrite = soup.get_text(separator=' ', strip=True)
                content_to_rewrite = content_to_rewrite[:3000] 
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch original news content: {str(e)}")

    if not content_to_rewrite or len(content_to_rewrite) < 100:
         raise HTTPException(status_code=400, detail="El contenido de la fuente es demasiado corto o inválido.")

    # 2. Configure Gemini with new SDK and use user preference
    try:
        client = genai.Client(api_key=current_user.gemini_api_key)
        
        # Determine model to use
        model_id = current_user.gemini_model or "gemini-flash-lite-latest"
        
        prompt = f"""
        Actúa como el Editor en Jefe del diario digital dominicano "La Agenda".
        Nuestro estilo es "Ejecutivo Dominicano": serio, profesional, analítico y elegante (estilo Bloomberg o Financial Times).
        
        Tu tarea es redactar una noticia ORIGINAL basada en la siguiente información de una fuente externa:
        
        --- INICIO INFORMACIÓN FUENTE ---
        URL FUENTE: {req.source_url}
        CONTENIDO:
        {content_to_rewrite}
        --- FIN INFORMACIÓN FUENTE ---
        
        REQUISITOS DE REDACCIÓN:
        1. NO hables en primera persona.
        2. El títular debe ser impactante pero profesional.
        3. El contenido debe tener al menos 4-5 párrafos.
        4. Al final del artículo, DEBES incluir una línea de referencia: "Basado en informaciones de [Nombre de Fuente Original]".
        5. Adapta los términos económicos al contexto dominicano si es necesario (ej. tasas de cambio, impacto local).
        6. Evita duplicar el texto exacto de la fuente, pero mantén todos los datos y hechos verídicos.
        7. Categoría asignada: {req.category}
        """
        
        # Use Structured Output with Pydantic
        response = client.models.generate_content(
            model=model_id,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AIArticleGenerateResponse, # Using our existing schema
            )
        )
        
        if not response or not response.parsed:
            # Fallback for models or scenarios where parsed is not available
            import json
            resp_text = response.text.strip()
            if "```json" in resp_text:
                resp_text = resp_text.split("```json")[1].split("```")[0].strip()
            elif "```" in resp_text:
                resp_text = resp_text.split("```")[1].split("```")[0].strip()
            
            result_dict = json.loads(resp_text)
            if isinstance(result_dict, list) and len(result_dict) > 0:
                result_dict = result_dict[0]
            
            return AIArticleGenerateResponse(
                title=result_dict.get("title", "Título no generado"),
                content=result_dict.get("content", "Contenido no generado"),
                author=result_dict.get("author", "IA La Agenda"),
                image_url=extracted_image_url # Use the extracted image from HTML
            )
        
        # Structured output worked perfectly
        result = response.parsed
        
        # Priority for the real image extracted from HTML
        if extracted_image_url:
            result.image_url = extracted_image_url
            
        print(f"AI Generation ({model_id}): Title='{result.title[:50]}...', Image='{result.image_url}'")
        return result
        
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "quota" in error_msg.lower():
            raise HTTPException(status_code=429, detail="Límite de API alcanzado. Por favor, espera 1 minuto e intenta de nuevo.")
        elif "404" in error_msg:
             raise HTTPException(status_code=404, detail=f"El modelo {model_id} no está disponible o el nombre es incorrecto.")
        
        raise HTTPException(status_code=500, detail=f"Error en Gemini IA ({model_id}): {error_msg}")
