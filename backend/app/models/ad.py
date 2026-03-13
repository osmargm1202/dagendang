from sqlalchemy import Column, String, Boolean, DateTime, UUID, Integer
import uuid
from datetime import datetime
from app.db.database import Base

class Advertisement(Base):
    __tablename__ = "advertisements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, index=True)
    image_url = Column(String)
    link_url = Column(String)
    position = Column(String, index=True)  # 'header', 'sidebar_top', 'sidebar_bottom', 'content_middle'
    is_active = Column(Boolean, default=True)
    rotation_seconds = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)
