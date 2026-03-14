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
    AIArticleGenerateRequest, AIArticleGenerateResponse, AIImageGenerateRequest
)
from app.core.security import get_current_user
from google import genai
from google.genai import types
from pathlib import Path
import time
from datetime import datetime, timedelta

router = APIRouter()

DEFAULT_ARTICLE_PROMPT_TEMPLATE = """
Actua como el Editor en Jefe del diario digital dominicano "La Agenda".
Nuestro estilo es "Ejecutivo Dominicano": serio, profesional, analitico y elegante, en una linea cercana a Bloomberg o Financial Times.

Tu tarea es redactar una noticia ORIGINAL basada en la siguiente informacion de una fuente externa:

--- INICIO INFORMACION FUENTE ---
URL FUENTE: {source_url}
CATEGORIA ASIGNADA: {category}
CONTENIDO:
{source_content}
--- FIN INFORMACION FUENTE ---

REQUISITOS DE REDACCION:
1. No hables en primera persona.
2. El titular debe ser impactante pero profesional.
3. El contenido debe tener al menos 4 o 5 parrafos.
4. Al final del articulo, debes incluir una linea de referencia: "Basado en informaciones de [Nombre de Fuente Original]".
5. Adapta los terminos economicos al contexto dominicano si es necesario.
6. Evita duplicar el texto exacto de la fuente, pero manten todos los datos y hechos veridicos.
7. La categoria del articulo es {category}.
8. Devuelve exclusivamente un objeto JSON compatible con el esquema esperado.
""".strip()

DEFAULT_IMAGE_PROMPT_TEMPLATE = """
Crea una imagen editorial de alta calidad para un diario digital.

Contexto del articulo:
- Titulo: {title}
- Categoria: {category}
- Resumen/base editorial:
{content_excerpt}

Instrucciones visuales:
- Representa la idea central del articulo con una sola escena clara, elegante y periodistica.
- Prioriza composiciones realistas o editorialmente verosimiles.
- Evita collage caotico, simbolos genericos vacios y elementos decorativos irrelevantes.
- No renderices textos, titulares, letras, rotulos, marcas de agua, logotipos ni tipografia dentro de la imagen, salvo que sea estrictamente inevitable y natural en la escena.
- Si aparece texto incidental en el entorno, debe ser minimo, secundario y no protagonista.
- Sin marcos, sin interfaz de app, sin capturas de pantalla, sin diseno de poster.
- La imagen debe funcionar como portada de noticia profesional.
""".strip()

LEGACY_TEXT_MODEL_ALIASES = {
    "gemini-flash-lite-latest": "gemini-3.1-flash-lite-preview",
    "gemini-1.5-flash": "gemini-3-flash-preview",
    "gemini-2.0-flash-exp": "gemini-3-flash-preview",
}

LEGACY_IMAGE_MODEL_ALIASES = {
    "gemini-2.5-flash-image": "gemini-3.1-flash-image-preview",
    "imagen-3": "gemini-3.1-flash-image-preview",
}

SUPPORTED_IMAGE_SIZES = {"1K", "2K", "4K"}


def _resolve_text_model(model_id: str | None) -> str:
    configured_model = (model_id or "").strip() or "gemini-3-flash-preview"
    return LEGACY_TEXT_MODEL_ALIASES.get(configured_model, configured_model)


def _resolve_image_model(model_id: str | None) -> str:
    configured_model = (model_id or "").strip() or "gemini-3.1-flash-image-preview"
    return LEGACY_IMAGE_MODEL_ALIASES.get(configured_model, configured_model)


def _resolve_image_size(image_size: str | None) -> str:
    configured_size = (image_size or "").strip().upper() or "1K"
    return configured_size if configured_size in SUPPORTED_IMAGE_SIZES else "1K"


def _extract_inline_image_data(response) -> tuple[bytes | None, str]:
    """
    The SDK can expose parts at different levels depending on the method/version.
    We inspect both direct parts and candidate content parts.
    """
    parts = []

    direct_parts = getattr(response, "parts", None)
    if direct_parts:
        parts.extend(direct_parts)

    candidates = getattr(response, "candidates", None) or []
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        candidate_parts = getattr(content, "parts", None) or []
        parts.extend(candidate_parts)

    for part in parts:
        inline_data = getattr(part, "inline_data", None)
        if inline_data and getattr(inline_data, "data", None):
            return inline_data.data, getattr(inline_data, "mime_type", None) or "image/png"

    return None, "image/png"


class _PromptContext(dict):
    def __missing__(self, key):
        return ""


def _build_image_prompt(req: AIImageGenerateRequest, current_user: User) -> str:
    title = (req.title or req.prompt or "").strip()
    category = (req.category or "general").strip()
    content = (req.content or "").strip()
    content_excerpt = content[:1800] if content else "Sin contenido adicional provisto."

    template = (current_user.image_prompt_template or DEFAULT_IMAGE_PROMPT_TEMPLATE).strip()
    article_context = (
        f"Titulo: {title}\n"
        f"Categoria: {category}\n"
        f"Contenido base:\n{content_excerpt}"
    ).strip()

    return template.format_map(
        _PromptContext(
            title=title,
            category=category,
            content=content,
            content_excerpt=content_excerpt,
            article_context=article_context,
            prompt=req.prompt or "",
        )
    )


def _build_article_prompt(
    source_url: str,
    category: str,
    source_content: str,
    current_user: User,
) -> str:
    template = (current_user.article_prompt_template or DEFAULT_ARTICLE_PROMPT_TEMPLATE).strip()
    source_excerpt = source_content[:3000]
    article_context = (
        f"URL FUENTE: {source_url}\n"
        f"CATEGORIA: {category}\n"
        f"CONTENIDO:\n{source_excerpt}"
    ).strip()

    return template.format_map(
        _PromptContext(
            source_url=source_url,
            category=category,
            source_content=source_excerpt,
            source_excerpt=source_excerpt,
            article_context=article_context,
        )
    )

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

# --- Global Cache for Suggestions ---
# Format: { "category_limit": { "timestamp": float, "data": List[NewsCandidate] } }
_SUGGESTIONS_CACHE = {}
_CACHE_TTL_SECONDS = 600 # 10 minutes
MAX_CACHED_SUGGESTIONS = 500

def _prune_suggestions_cache():
    """Ensures the global cache doesn't grow indefinitely."""
    if len(_SUGGESTIONS_CACHE) > 50: # Number of unique search keys (category+limit combos)
        # Sort by timestamp (delete oldest)
        sorted_keys = sorted(_SUGGESTIONS_CACHE.keys(), key=lambda k: _SUGGESTIONS_CACHE[k]["timestamp"])
        for k in sorted_keys[:10]:
            del _SUGGESTIONS_CACHE[k]

@router.post("/suggest", response_model=AIPreviewResponse)
async def get_ai_suggestions(req: AISuggestionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Scrapes news sources and suggests news candidates.
    Uses a 10-minute server-side cache to improve performance.
    """
    cache_key = f"{req.category or 'all'}_{req.limit}"
    now = time.time()

    if not req.force_refresh:
        cached = _SUGGESTIONS_CACHE.get(cache_key)
        if cached and (now - cached["timestamp"] < _CACHE_TTL_SECONDS):
            print(f"DEBUG AI: Serving suggestions from cache for key: {cache_key}")
            return {"suggestions": cached["data"]}

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
    
    # Update cache
    _prune_suggestions_cache()
    
    # Store candidates and maintain a limit of 500 per entry to avoid huge memory usage
    final_suggestions = suggestions[:req.limit]
    
    _SUGGESTIONS_CACHE[cache_key] = {
        "timestamp": now,
        "data": suggestions[:500] # Cache up to 500 for potential reuse with different limits
    }
    
    return {"suggestions": final_suggestions}

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
        configured_model_id = current_user.gemini_model or "gemini-3-flash-preview"
        model_id = _resolve_text_model(configured_model_id)
        
        prompt = _build_article_prompt(
            source_url=req.source_url,
            category=req.category,
            source_content=content_to_rewrite,
            current_user=current_user,
        )
        
        # Use Structured Output with Pydantic
        response = client.models.generate_content(
            model=model_id,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AIArticleGenerateResponse, # Using our existing schema
                thinking_config=types.ThinkingConfig(
                    thinking_level="low",
                ),
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
            
        print(
            f"AI Generation (configured={configured_model_id}, resolved={model_id}): "
            f"Title='{result.title[:50]}...', Image='{result.image_url}'"
        )
        return result
        
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "quota" in error_msg.lower():
            raise HTTPException(status_code=429, detail="Límite de API alcanzado. Por favor, espera 1 minuto e intenta de nuevo.")
        elif "404" in error_msg:
             raise HTTPException(status_code=404, detail=f"El modelo {model_id} no está disponible o el nombre es incorrecto.")
        
        raise HTTPException(status_code=500, detail=f"Error en Gemini IA ({model_id}): {error_msg}")

@router.post("/generate-image")
async def generate_image_with_ai(req: AIImageGenerateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Generates an image using the model and configuration provided by the user example.
    """
    if not current_user.gemini_api_key:
        raise HTTPException(status_code=400, detail="Gemini API Key is not configured in your profile.")
    if not (req.title or req.prompt):
        raise HTTPException(status_code=400, detail="Se requiere al menos un titulo o prompt para generar la imagen.")

    try:
        client = genai.Client(api_key=current_user.gemini_api_key)
        
        # Accept legacy stored values, but always call Gemini with a currently valid model id.
        configured_model_id = current_user.gemini_image_model or "gemini-3.1-flash-image-preview"
        model_id = _resolve_image_model(configured_model_id)

        generate_content_config = types.GenerateContentConfig(
            response_modalities=["IMAGE"],
            image_config=types.ImageConfig(
                aspect_ratio="16:9",
                image_size=_resolve_image_size(current_user.gemini_image_size),
            ),
        )
        final_prompt = _build_image_prompt(req, current_user)

        print(
            f"DEBUG AI: Generating image with configured model "
            f"{configured_model_id} (resolved to {model_id}) for title: {req.title or req.prompt}"
        )

        response = client.models.generate_content(
            model=model_id,
            contents=final_prompt,
            config=generate_content_config,
        )

        image_data, mime_type = _extract_inline_image_data(response)

        if not image_data:
            response_text = getattr(response, "text", None)
            print(f"DEBUG AI: ERROR - No image data found. Text response: {response_text!r}")
            raise HTTPException(
                status_code=500,
                detail=(
                    "Gemini no devolvió datos de imagen. "
                    "Verifica que el modelo configurado soporte salida de imagen."
                ),
            )

        import uuid
        import mimetypes

        # Save to uploads directory
        file_name = f"{uuid.uuid4().hex}"
        extension = mimetypes.guess_extension(mime_type) or ".png"
        full_file_name = f"{file_name}{extension}"
        uploads_dir = Path("uploads")
        uploads_dir.mkdir(parents=True, exist_ok=True)
        file_path = uploads_dir / full_file_name

        with open(file_path, "wb") as f:
            f.write(image_data)

        # Return the URL
        image_url = f"/uploads/{full_file_name}"
        return {"image_url": image_url}

    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        print(f"Error generating AI image: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Error al generar imagen con IA: {error_msg}")
