from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import articles, economy, auth, upload, ai
import os

app = FastAPI(title="La Agenda API")

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

from contextlib import asynccontextmanager
import asyncio
from app.core import scraper
from app.db.database import SessionLocal
from app.models.economy import ExchangeRate, FuelPrice

async def daily_scraper_task():
    while True:
        try:
            db = SessionLocal()
            rates_data = await scraper.scrape_bancentral_rates()
            fuel_data = await scraper.scrape_micm_fuel_prices()
            
            if rates_data:
                existing_rate = db.query(ExchangeRate).filter(ExchangeRate.date == rates_data["date"]).first()
                if not existing_rate:
                    db.add(ExchangeRate(**rates_data))
                    db.commit()
            if fuel_data:
                existing_fuel = db.query(FuelPrice).filter(FuelPrice.date == fuel_data["date"]).first()
                if not existing_fuel:
                    db.add(FuelPrice(**fuel_data))
                    db.commit()
            db.close()
        except Exception as e:
            print(f"Error in background scraper loop: {e}")
        
        # Sleep for 12 hours (43200 seconds)
        await asyncio.sleep(43200)

@app.on_event("startup")
async def start_background_tasks():
    asyncio.create_task(daily_scraper_task())

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:3550",
    "https://diariodigital.delioserver.duckdns.org"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(articles.router, prefix="/api/articles", tags=["Articles"])
app.include_router(economy.router, prefix="/api/economy", tags=["Economy"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Intelligence"])

@app.get("/")
def read_root():
    return {"message": "Welcome to La Agenda API"}
