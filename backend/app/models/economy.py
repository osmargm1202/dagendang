from sqlalchemy import Column, Integer, Float, Date, DateTime
import datetime
from zoneinfo import ZoneInfo
from app.db.database import Base

def get_dr_time():
    return datetime.datetime.now(ZoneInfo("America/Santo_Domingo"))

class ExchangeRate(Base):
    __tablename__ = "exchange_rates"

    id = Column(Integer, primary_key=True, index=True)
    usd_buy = Column(Float, nullable=False)
    usd_sell = Column(Float, nullable=False)
    eur_buy = Column(Float, nullable=False)
    eur_sell = Column(Float, nullable=False)
    date = Column(Date, nullable=False, unique=True)
    created_at = Column(DateTime, default=get_dr_time)


class FuelPrice(Base):
    __tablename__ = "fuel_prices"

    id = Column(Integer, primary_key=True, index=True)
    gasoline_premium = Column(Float, nullable=False)
    gasoline_regular = Column(Float, nullable=False)
    diesel_optimum = Column(Float, nullable=False)
    diesel_regular = Column(Float, nullable=False)
    glp = Column(Float, nullable=False, default=132.60)
    gas_natural = Column(Float, nullable=False, default=43.90)
    date = Column(Date, nullable=False, unique=True)
    created_at = Column(DateTime, default=get_dr_time)
