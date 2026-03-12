import asyncio
import httpx
import xml.etree.ElementTree as ET
from datetime import datetime
from zoneinfo import ZoneInfo
from app.db.database import SessionLocal
from app.models.article import Article

def get_dr_time():
    return datetime.now(ZoneInfo("America/Santo_Domingo"))

FEEDS = [
    {"url": "https://listindiario.com/rss/portada.html", "source": "Listín Diario", "type": "nacional"},
    {"url": "https://www.diariolibre.com/rss/portada.xml", "source": "Diario Libre", "type": "nacional"},
    {"url": "https://elnuevodiario.com.do/feed/", "source": "El Nuevo Diario", "type": "nacional"},
]

async def fetch_rss(url):
    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            return response.text
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

async def parse_and_insert():
    db = SessionLocal()
    try:
        for feed in FEEDS:
            xml_data = await fetch_rss(feed["url"])
            if not xml_data:
                continue
            
            try:
                root = ET.fromstring(xml_data)
                channel = root.find("channel")
                
                # Check for items
                items = channel.findall("item")[:3] # Get top 3 from each
                for item in items:
                    title = item.find("title").text if item.find("title") is not None else "Sin Titulo"
                    description = item.find("description").text if item.find("description") is not None else ""
                    link = item.find("link").text if item.find("link") is not None else ""
                    
                    # Try to find image url
                    image_url = None
                    enclosure = item.find("enclosure")
                    if enclosure is not None and enclosure.get("type", "").startswith("image"):
                        image_url = enclosure.get("url")
                    else:
                        media = item.find("{http://search.yahoo.com/mrss/}content")
                        if media is not None and media.get("medium") == "image":
                            image_url = media.get("url")
                            
                    # Fallback for El Nuevo Diario: extract from content:encoded or description
                    if not image_url:
                        content_encoded = item.find("{http://purl.org/rss/1.0/modules/content/}encoded")
                        html_content = ""
                        if content_encoded is not None and content_encoded.text:
                            html_content = content_encoded.text
                        elif description:
                            html_content = description
                            
                        if html_content:
                            img_match = re.search(r'<img[^>]+src="([^">]+)"', html_content)
                            if img_match:
                                image_url = img_match.group(1)

                    local_image_path = None
                    if image_url:
                        try:
                            import uuid, os
                            async with httpx.AsyncClient(follow_redirects=True) as client:
                                img_response = await client.get(image_url, timeout=10.0)
                                if img_response.status_code == 200:
                                    ext = "jpg"
                                    if "png" in image_url.lower(): ext = "png"
                                    filename = f"{uuid.uuid4().hex}.{ext}"
                                    upload_dir = "/app/uploads"
                                    os.makedirs(upload_dir, exist_ok=True)
                                    file_path = os.path.join(upload_dir, filename)
                                    with open(file_path, "wb") as f:
                                        f.write(img_response.content)
                                    local_image_path = f"/uploads/{filename}"
                        except Exception as e:
                            print(f"Error downloading image {image_url}: {e}")

                    # Clean up description (remove HTML tags)
                    import re
                    clean_desc = re.sub('<[^<]+>', '', description)
                    
                    content = f"{clean_desc}\n\n[Fuente: {feed['source']}]({link})"
                    
                    # Check if exists
                    existing = db.query(Article).filter(Article.title == title).first()
                    if not existing:
                        article_data = {
                            "title": title,
                            "content": content,
                            "type": feed["type"],
                            "author": feed["source"],
                            "status": "published",
                            "image_url": local_image_path,
                            "is_active": True,
                            "published_at": get_dr_time()
                        }
                        db.add(Article(**article_data))
                        print(f"Inserted: {title} (with image: {bool(local_image_path)})")
                db.commit()
            except Exception as e:
                print(f"Error parsing {feed['url']}: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(parse_and_insert())
