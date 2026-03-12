from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.economy import ExchangeRate, FuelPrice
from app.schemas.economy import ExchangeRateResponse, FuelPriceResponse

router = APIRouter()

@router.get("/exchange-rate/latest", response_model=ExchangeRateResponse)
def get_latest_exchange_rate(db: Session = Depends(get_db)):
    rate = db.query(ExchangeRate).order_by(ExchangeRate.date.desc()).first()
    if not rate:
        # Fallback dummy data if no data scraped yet
        return {"id": 0, "usd_buy": 58.70, "usd_sell": 59.20, "eur_buy": 63.40, "eur_sell": 64.10, "date": "2024-01-01", "created_at": "2024-01-01T00:00:00"}
    return rate

@router.get("/fuel-prices/latest", response_model=FuelPriceResponse)
def get_latest_fuel_prices(db: Session = Depends(get_db)):
    prices = db.query(FuelPrice).order_by(FuelPrice.date.desc()).first()
    if not prices:
        # Fallback dummy data if no data scraped yet
        return {"id": 0, "gasoline_premium": 290.10, "gasoline_regular": 272.50, "diesel_optimum": 239.10, "diesel_regular": 221.60, "glp": 132.60, "gas_natural": 43.90, "date": "2024-01-01", "created_at": "2024-01-01T00:00:00"}
    return prices
from app.core import scraper
import datetime

@router.post("/scrape", response_model=dict)
async def trigger_scrape(db: Session = Depends(get_db)):
    rates_data = await scraper.scrape_bancentral_rates()
    fuel_data = await scraper.scrape_micm_fuel_prices()
    
    if rates_data:
        # Check if already exists for today
        existing_rate = db.query(ExchangeRate).filter(ExchangeRate.date == rates_data["date"]).first()
        if not existing_rate:
            new_rate = ExchangeRate(**rates_data)
            db.add(new_rate)
            db.commit()
            
    if fuel_data:
        existing_fuel = db.query(FuelPrice).filter(FuelPrice.date == fuel_data["date"]).first()
        if not existing_fuel:
            new_fuel = FuelPrice(**fuel_data)
            db.add(new_fuel)
            db.commit()
            
    return {"message": "Scrape completed", "rates_scraped": bool(rates_data), "fuel_scraped": bool(fuel_data)}
