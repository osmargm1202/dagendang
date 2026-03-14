from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "editor"
    gemini_api_key: Optional[str] = None
    gemini_model: Optional[str] = "gemini-3-flash-preview"
    gemini_image_model: Optional[str] = "gemini-3.1-flash-image-preview"
    gemini_image_size: Optional[str] = "1K"
    article_prompt_template: Optional[str] = None
    image_prompt_template: Optional[str] = None
    is_active: bool = True
    is_premium: bool = False
    backup_limit_gb: int = 10
    backup_frequency_hours: int = 2

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    gemini_api_key: Optional[str] = None
    gemini_model: Optional[str] = None
    gemini_image_model: Optional[str] = None
    gemini_image_size: Optional[str] = None
    article_prompt_template: Optional[str] = None
    image_prompt_template: Optional[str] = None
    is_active: Optional[bool] = None
    backup_limit_gb: Optional[int] = None
    backup_frequency_hours: Optional[int] = None

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    email: Optional[str] = None
