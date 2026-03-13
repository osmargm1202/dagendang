from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()

class SubscriptionCreate(BaseModel):
    plan: str # 'mensual' or 'anual'

@router.post("/subscribe")
def subscribe_user(
    subscription: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Simulate payment processing
    # In a real scenario, we would integrate Stripe/Azul here
    
    current_user.is_premium = True
    db.commit()
    
    return {"message": f"Suscripción {subscription.plan} activada exitosamente"}

@router.get("/status")
def get_subscription_status(current_user: User = Depends(get_current_user)):
    return {
        "is_premium": current_user.is_premium,
        "email": current_user.email
    }

@router.post("/toggle-premium")
def toggle_premium_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.is_premium = not current_user.is_premium
    db.commit()
    return {"is_premium": current_user.is_premium}
