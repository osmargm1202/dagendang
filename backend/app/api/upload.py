import os
import shutil
import uuid
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

UPLOAD_DIR = "uploads"

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("")
async def upload_image(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Invalid file type. Only images are allowed.")
    
    # Generate unique filename
    ext = file.filename.split('.')[-1]
    filename = f"{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"url": f"/uploads/{filename}"}
