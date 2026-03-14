from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ArticleBase(BaseModel):
    title: str
    content: str
    author: Optional[str] = None
    type: str
    image_url: Optional[str] = None
    status: str = "published"
    is_premium: Optional[bool] = False
    ad_image_url: Optional[str] = None
    ad_link: Optional[str] = None
    is_active: bool = True

class ArticleCreate(ArticleBase):
    pass

class ArticleResponse(ArticleBase):
    id: int
    published_at: datetime

    class Config:
        from_attributes = True
