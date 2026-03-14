from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.db.database import get_db
from app.models.article import Article
from app.models.category import Category
from app.models.comment import Comment
from app.schemas.article import ArticleCreate, ArticleResponse
from app.schemas.category import CategoryCreate, CategoryResponse

from app.models.user import User
from app.core.security import get_current_user
import os
from pathlib import Path

MAX_ARTICLES = 500

def _delete_local_file(url: str):
    """Auxiliary to delete local files from uploads folder"""
    if not url or not url.startswith("/uploads/"):
        return
    # Remove leading slash and resolve path
    relative_path = url.lstrip("/")
    file_path = Path(relative_path)
    try:
        if file_path.exists():
            os.remove(file_path)
            print(f"DEBUG Cleanup: Deleted file {file_path}")
    except Exception as e:
        print(f"DEBUG Cleanup: Error deleting file {file_path}: {e}")

def _cleanup_old_articles(db: Session):
    """Keeps the article count below MAX_ARTICLES by deleting the oldest ones."""
    total = db.query(Article).count()
    if total <= MAX_ARTICLES:
        return
    
    to_delete_count = total - MAX_ARTICLES
    # Order by published_at ASC to get the oldest
    old_articles = db.query(Article).order_by(Article.published_at.asc()).limit(to_delete_count).all()
    
    for art in old_articles:
        _delete_local_file(art.image_url)
        _delete_local_file(art.ad_image_url)
        # Delete associated comments manually to avoid FK violations
        db.query(Comment).filter(Comment.article_id == art.id).delete()
        db.delete(art)
    
    db.commit()
    print(f"DEBUG Cleanup: Deleted {to_delete_count} old articles to maintain limit of {MAX_ARTICLES}")

router = APIRouter()

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db), include_inactive: bool = False):
    query = db.query(Category)
    if not include_inactive:
        query = query.filter(Category.is_active == True)
    return query.order_by(Category.order.asc(), Category.name.asc()).all()

@router.post("/categories", response_model=CategoryResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_category = Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.put("/categories/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, category_update: CategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = category_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)
        
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if category is in use
    article_count = db.query(Article).filter(Article.type == db_category.slug).count()
    if article_count > 0:
        raise HTTPException(status_code=400, detail=f"No se puede eliminar: La categoría está en uso por {article_count} artículos.")
    
    db.delete(db_category)
    db.commit()
    return {"detail": "Category deleted successfully"}

@router.get("/count")
def get_articles_count(
    db: Session = Depends(get_db),
    status: Optional[str] = None,
    type: Optional[str] = None,
    search: Optional[str] = None
):
    query = db.query(Article)
    if status is not None:
        query = query.filter(Article.status == status)
    if type is not None:
        query = query.filter(Article.type == type)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (func.unaccent(Article.title).ilike(func.unaccent(search_filter))) | 
            (func.unaccent(Article.content).ilike(func.unaccent(search_filter)))
        )
    return {"total": query.count()}

@router.get("", response_model=List[ArticleResponse])
def get_articles(
    db: Session = Depends(get_db), 
    skip: int = 0, 
    limit: int = 10, 
    status: Optional[str] = None, 
    type: Optional[str] = None,
    search: Optional[str] = None,
    published_before: Optional[str] = None,
    published_after: Optional[str] = None
):
    query = db.query(Article)
    if status is not None:
        query = query.filter(Article.status == status)
    if type is not None:
        query = query.filter(Article.type == type)
    if published_before:
        query = query.filter(Article.published_at < published_before)
    if published_after:
        query = query.filter(Article.published_at > published_after)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (func.unaccent(Article.title).ilike(func.unaccent(search_filter))) | 
            (func.unaccent(Article.content).ilike(func.unaccent(search_filter)))
        )
    
    if published_after:
        articles = query.order_by(Article.published_at.asc()).offset(skip).limit(limit).all()
    else:
        articles = query.order_by(Article.published_at.desc()).offset(skip).limit(limit).all()
    
    return articles

@router.post("", response_model=ArticleResponse)
def create_article(article: ArticleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Automatically set author to the logged-in user if not provided
    if not article.author:
        article.author = current_user.full_name or "Redacción"
        
    db_article = Article(**article.model_dump())
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    
    # Run cleanup to maintain limit (500 articles)
    _cleanup_old_articles(db)
    
    return db_article

@router.get("/{article_id}", response_model=ArticleResponse)
def get_article(article_id: int, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@router.put("/{article_id}", response_model=ArticleResponse)
def update_article(article_id: int, article_update: ArticleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_article = db.query(Article).filter(Article.id == article_id).first()
    if db_article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    
    update_data = article_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_article, key, value)
        
    db.commit()
    db.refresh(db_article)
    return db_article

@router.delete("/{article_id}")
def delete_article(article_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_article = db.query(Article).filter(Article.id == article_id).first()
    if db_article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    
    db.delete(db_article)
    db.commit()
    return {"detail": "Article deleted successfully"}
