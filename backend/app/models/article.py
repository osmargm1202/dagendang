from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Enum
import enum
import datetime
from zoneinfo import ZoneInfo
from app.db.database import Base

def get_dr_time():
    return datetime.datetime.now(ZoneInfo("America/Santo_Domingo"))

class ArticleType(enum.Enum):
    opinion = "opinion"
    editorial = "editorial"
    mercados = "mercados"
    finanzas = "finanzas"
    empresas = "empresas"
    nacional = "nacional"
    economia = "economia"

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String(100), nullable=True)
    type = Column(Enum(ArticleType), nullable=False)
    image_url = Column(String(500), nullable=True)
    status = Column(String(50), default="published")
    is_premium = Column(Boolean, default=False)
    ad_image_url = Column(String(500), nullable=True)
    ad_link = Column(String(500), nullable=True)
    published_at = Column(DateTime, default=get_dr_time)
    is_active = Column(Boolean, default=True)
