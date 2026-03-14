from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import Token, UserResponse, UserCreate, UserUpdate
from app.core.security import verify_password, create_access_token, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user
from datetime import timedelta

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user.role
    }

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Public registration for new readers/subscribers.
    Generates a verification token and sends a confirmation email.
    """
    import uuid
    from fastapi import BackgroundTasks
    from app.core.email import send_verification_email

    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    token = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role="subscriber",
        is_verified=False,
        verification_token=token
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send email in the background to not block the response
    # (Note: In a more complex app, we'd use a task queue like Celery)
    import asyncio
    asyncio.create_task(send_verification_email(new_user.email, token))
    
    return new_user

@router.get("/verify/{token}")
async def verify_account(token: str, db: Session = Depends(get_db)):
    """
    Verfies a user account using the token sent by email.
    """
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=404, detail="Token de verificación inválido o expirado.")
    
    user.is_verified = True
    user.verification_token = None # Clear token after verification
    db.add(user)
    db.commit()
    
    return {"detail": "¡Cuenta verificada con éxito! Ya puedes iniciar sesión y participar."}

@router.post("/register-initial-admin", response_model=UserResponse)
def create_initial_admin(user: UserCreate, db: Session = Depends(get_db)):
    """
    Temporary endpoint to create the first admin.
    In production, this should be removed or highly secured.
    """
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role="admin"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_user_me(user_update: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Update the current authenticated user's profile.
    Used for setting the Gemini API key among other fields.
    """
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
