from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    article_id: int

class CommentResponse(CommentBase):
    id: int
    article_id: int
    user_id: int
    user_full_name: Optional[str] = None
    created_at: datetime
    is_approved: bool

    class Config:
        from_attributes = True
