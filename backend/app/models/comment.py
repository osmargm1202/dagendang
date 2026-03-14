from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.db.database import Base

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_approved = Column(Boolean, default=True) # Default to true for now, can be changed for moderation
    
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
