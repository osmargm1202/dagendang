from app.db.database import SessionLocal
from app.models.economy import ExchangeRate, FuelPrice
from datetime import date, timedelta
import random

def seed_history():
    db = SessionLocal()
    try:
        # Create history for the last 15 days (more points for the chart)
        for i in range(1, 16):
            target_date = date.today() - timedelta(days=i)
            
            # Seed rates
            existing_rate = db.query(ExchangeRate).filter(ExchangeRate.date == target_date).first()
            if not existing_rate:
                db.add(ExchangeRate(
                    usd_buy=58.5 + random.uniform(-0.5, 0.5),
                    usd_sell=59.0 + random.uniform(-0.5, 0.5),
                    eur_buy=63.0 + random.uniform(-1, 1),
                    eur_sell=64.0 + random.uniform(-1, 1),
                    date=target_date
                ))
            
            # Seed fuel
            existing_fuel = db.query(FuelPrice).filter(FuelPrice.date == target_date).first()
            if not existing_fuel:
                db.add(FuelPrice(
                    gasoline_premium=290.10 + random.uniform(-5, 5),
                    gasoline_regular=272.50 + random.uniform(-5, 5),
                    diesel_optimum=239.10 + random.uniform(-3, 3),
                    diesel_regular=221.60 + random.uniform(-3, 3),
                    glp=132.60,
                    gas_natural=43.90,
                    date=target_date
                ))
        db.commit()
        print("Historical dummy data seeded successfully.")
    except Exception as e:
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_history()
