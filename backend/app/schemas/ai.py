from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class NewsSourceType(str, Enum):
    rss = "rss"
    atom = "atom"
    web = "web"

class NewsSourceBase(BaseModel):
    name: str
    url: str
    type: NewsSourceType = NewsSourceType.rss
    category: str
    is_active: bool = True

class NewsSourceCreate(NewsSourceBase):
    pass

class NewsSourceUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    type: Optional[NewsSourceType] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None

class NewsSourceResponse(NewsSourceBase):
    id: int

    class Config:
        from_attributes = True

class AISuggestionRequest(BaseModel):
    category: Optional[str] = None
    limit: int = 5

class NewsCandidate(BaseModel):
    title: str
    source_url: str
    original_published_at: Optional[str] = None
    source_name: str
    category: str
    image_url: Optional[str] = None

class AIPreviewResponse(BaseModel):
    suggestions: List[NewsCandidate]

class AIArticleGenerateRequest(BaseModel):
    source_url: str
    category: str
    is_premium: bool = False

class AIArticleGenerateResponse(BaseModel):
    title: str
    content: str
    author: str
    image_url: Optional[str] = None

class AIImageGenerateRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    prompt: Optional[str] = None
