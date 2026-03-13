from sqlalchemy import Column, Integer, String, Boolean
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="editor") # "admin" or "editor"
    gemini_api_key = Column(String(255), nullable=True) # Only for admin/dashboard configuration
    gemini_model = Column(String(50), default="gemini-flash-lite-latest")
    is_active = Column(Boolean, default=True)
    is_premium = Column(Boolean, default=False)
