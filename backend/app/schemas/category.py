from pydantic import BaseModel
from typing import Optional

class CategoryBase(BaseModel):
    slug: str
    name: str
    is_active: bool = True
    order: int = 0

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True
