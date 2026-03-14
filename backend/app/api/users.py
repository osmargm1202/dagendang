from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.core.security import get_current_user

router = APIRouter()

@router.get("", response_model=List[UserResponse])
async def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all registered users. Only accessible by admins.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación no permitida. Se requieren privilegios de administrador."
        )
    
    users = db.query(User).all()
    return users

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a user by ID. Only accessible by admins.
    Admins cannot delete themselves from this endpoint.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación no permitida. Se requieren privilegios de administrador."
        )
    
    user_to_delete = db.query(User).filter(User.id == user_id).first()
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    
    if user_to_delete.id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta de administrador desde aquí.")
    
    db.delete(user_to_delete)
    db.commit()
    
    return {"detail": "Usuario eliminado exitosamente."}
