from sqlalchemy import Column, Integer, String, Boolean, Enum
import enum
from app.db.database import Base

class NewsSourceType(enum.Enum):
    rss = "rss"
    atom = "atom"
    web = "web"

class NewsSource(Base):
    __tablename__ = "news_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    url = Column(String(500), nullable=False, unique=True)
    type = Column(Enum(NewsSourceType), default=NewsSourceType.rss)
    category = Column(String(50), nullable=False) # e.g. "nacional", "economia"
    is_active = Column(Boolean, default=True)
