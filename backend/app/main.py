from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import articles, economy, auth, upload, ai, ads, subscriptions, backups, comments, users
import os

app = FastAPI(title="La Agenda API")

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

from datetime import datetime
from contextlib import asynccontextmanager
import asyncio
from app.core import scraper
from app.db.database import SessionLocal
from app.models.economy import ExchangeRate, FuelPrice
from app.models.category import Category

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
            
            # Seed categories if none exist
            if db.query(Category).count() == 0:
                initial_categories = [
                    {"slug": "editorial", "name": "Editorial", "order": 1},
                    {"slug": "nacional", "name": "Nacional", "order": 2},
                    {"slug": "economia", "name": "Economía", "order": 3},
                    {"slug": "empresas", "name": "Empresas", "order": 4},
                    {"slug": "mercados", "name": "Mercados", "order": 5},
                    {"slug": "opinion", "name": "Opinión", "order": 6},
                    {"slug": "finanzas", "name": "Finanzas", "order": 7}
                ]
                for cat in initial_categories:
                    db.add(Category(**cat))
                db.commit()
                
            db.close()
        except Exception as e:
            print(f"Error in background scraper loop: {e}")
        
        # Sleep for 12 hours (43200 seconds)
        await asyncio.sleep(43200)

async def periodic_backup_task():
    while True:
        try:
            # Get freq from DB
            from app.db.database import SessionLocal
            from app.models.user import User
            db = SessionLocal()
            admin = db.query(User).filter(User.role == "admin").first()
            freq = admin.backup_frequency_hours if (admin and admin.backup_frequency_hours) else 2
            db.close()

            print(f"[{datetime.now()}] Iniciando backup periódico automático (Frecuencia: {freq}h)...", flush=True)
            from app.api.backups import run_backup
            run_backup()
            
            # Now sleep for the interval
            await asyncio.sleep(freq * 3600)
        except Exception as e:
            print(f"Error in background backup loop: {e}", flush=True)
            await asyncio.sleep(300) # Wait 5 mins on error

@app.on_event("startup")
async def start_background_tasks():
    asyncio.create_task(daily_scraper_task())
    asyncio.create_task(periodic_backup_task())

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
app.include_router(ads.router, prefix="/api/ads", tags=["Advertisements"])
app.include_router(subscriptions.router, prefix="/api/subscriptions", tags=["Subscriptions"])
app.include_router(backups.router, prefix="/api/backups", tags=["Backups"])
app.include_router(comments.router, prefix="/api/comments", tags=["Comments"])
app.include_router(users.router, prefix="/api/users", tags=["User Management"])

@app.get("/")
def read_root():
    return {"message": "Welcome to La Agenda API"}
