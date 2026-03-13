from pydantic import BaseModel, HttpUrl
from uuid import UUID
from datetime import datetime
from typing import Optional

class AdBase(BaseModel):
    title: str
    image_url: str
    link_url: str
    position: str  # 'header', 'sidebar_top', 'sidebar_bottom', 'content_middle'
    is_active: bool = True
    rotation_seconds: Optional[int] = 5

class AdCreate(AdBase):
    pass

class AdUpdate(BaseModel):
    title: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    position: Optional[str] = None
    is_active: Optional[bool] = None
    rotation_seconds: Optional[int] = None

class AdvertisementSchema(AdBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
