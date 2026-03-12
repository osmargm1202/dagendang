from pydantic import BaseModel
from datetime import date, datetime

class ExchangeRateBase(BaseModel):
    usd_buy: float
    usd_sell: float
    eur_buy: float
    eur_sell: float
    date: date

class ExchangeRateResponse(ExchangeRateBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class FuelPriceBase(BaseModel):
    gasoline_premium: float
    gasoline_regular: float
    diesel_optimum: float
    diesel_regular: float
    glp: float
    gas_natural: float
    date: date

class FuelPriceResponse(FuelPriceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
