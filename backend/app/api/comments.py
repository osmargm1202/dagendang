from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.comment import Comment
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentResponse
from app.core.security import get_current_user

router = APIRouter()

@router.get("/articles/{article_id}", response_model=List[CommentResponse])
async def get_comments(article_id: int, db: Session = Depends(get_db)):
    """
    Get all approved comments for a specific article.
    """
    comments = db.query(Comment, User.full_name.label("user_full_name"))\
        .join(User, Comment.user_id == User.id)\
        .filter(Comment.article_id == article_id)\
        .filter(Comment.is_approved == True)\
        .order_by(Comment.created_at.desc())\
        .all()
    
    # Format the result to match the schema
    result = []
    for c, user_full_name in comments:
        res = CommentResponse.model_validate(c)
        res.user_full_name = user_full_name
        result.append(res)
        
    return result

@router.post("/", response_model=CommentResponse)
async def create_comment(
    comment: CommentCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Post a new comment. Only allowed for verified users.
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Debes verificar tu cuenta por correo antes de poder comentar."
        )
    
    db_comment = Comment(
        content=comment.content,
        article_id=comment.article_id,
        user_id=current_user.id,
        is_approved=True # Default to true, change if moderation is strictly needed
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    # Manually attach user name for the response
    response = CommentResponse.model_validate(db_comment)
    response.user_full_name = current_user.full_name
    
    return response

@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Delete a comment. Only the author or an admin can do this.
    """
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comentario no encontrado")
    
    if db_comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este comentario")
    
    db.delete(db_comment)
    db.commit()
    return {"detail": "Comentario eliminado"}
