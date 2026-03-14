from sqlalchemy import Column, Integer, String, Boolean, Text
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="editor") # "admin" or "editor"
    gemini_api_key = Column(String(255), nullable=True) # Only for admin/dashboard configuration
    gemini_model = Column(String(50), default="gemini-3-flash-preview")
    gemini_image_model = Column(String(50), default="gemini-3.1-flash-image-preview")
    gemini_image_size = Column(String(10), default="1K")
    article_prompt_template = Column(Text, nullable=True)
    image_prompt_template = Column(Text, nullable=True)
    backup_limit_gb = Column(Integer, default=10)
    backup_frequency_hours = Column(Integer, default=2)
    is_active = Column(Boolean, default=True)
    is_premium = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(255), nullable=True)
