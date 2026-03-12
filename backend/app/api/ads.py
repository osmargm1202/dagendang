from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.db.database import get_db
from app.models.ad import Advertisement
from app.schemas.ad import AdCreate, AdUpdate, AdvertisementSchema
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("", response_model=List[AdvertisementSchema])
def get_ads(db: Session = Depends(get_db), position: Optional[str] = None, active_only: bool = False):
    query = db.query(Advertisement)
    if position:
        query = query.filter(Advertisement.position == position)
    if active_only:
        query = query.filter(Advertisement.is_active == True)
    return query.order_by(Advertisement.created_at.desc()).all()

@router.post("", response_model=AdvertisementSchema)
def create_ad(ad: AdCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_ad = Advertisement(**ad.model_dump())
    db.add(db_ad)
    db.commit()
    db.refresh(db_ad)
    return db_ad

@router.get("/{ad_id}", response_model=AdvertisementSchema)
def get_ad(ad_id: UUID, db: Session = Depends(get_db)):
    ad = db.query(Advertisement).filter(Advertisement.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    return ad

@router.put("/{ad_id}", response_model=AdvertisementSchema)
def update_ad(ad_id: UUID, ad_update: AdUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_ad = db.query(Advertisement).filter(Advertisement.id == ad_id).first()
    if not db_ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    
    update_data = ad_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_ad, key, value)
    
    db.commit()
    db.refresh(db_ad)
    return db_ad

@router.delete("/{ad_id}")
def delete_ad(ad_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_ad = db.query(Advertisement).filter(Advertisement.id == ad_id).first()
    if not db_ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    
    db.delete(db_ad)
    db.commit()
    return {"detail": "Ad deleted"}
