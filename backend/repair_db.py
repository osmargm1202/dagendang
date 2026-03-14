from app.db.database import SessionLocal
from app.models.user import User

def repair_users():
    db = SessionLocal()
    try:
        # Set is_verified to True for any user that currently has it as NULL
        users = db.query(User).filter(User.is_verified == None).all()
        print(f"Repairing {len(users)} users...")
        for user in users:
            user.is_verified = True
        db.commit()
        print("Repair complete.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    repair_users()
