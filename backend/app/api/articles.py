from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.article import Article
from app.schemas.article import ArticleCreate, ArticleResponse

from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

from typing import List, Optional

@router.get("", response_model=List[ArticleResponse])
def get_articles(db: Session = Depends(get_db), skip: int = 0, limit: int = 10, status: Optional[str] = None, type: Optional[str] = None):
    query = db.query(Article)
    if status is not None:
        query = query.filter(Article.status == status)
    if type is not None:
        query = query.filter(Article.type == type)
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
