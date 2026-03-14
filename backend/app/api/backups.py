from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import os
import subprocess
from datetime import datetime
from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

BACKUP_DIR = "/app/backups"

# Ensure backup directory exists
if not os.path.exists(BACKUP_DIR):
    os.makedirs(BACKUP_DIR, exist_ok=True)

def prune_backups(limit_gb: float):
    if not os.path.exists(BACKUP_DIR):
        return
    
    limit_bytes = limit_gb * 1024 * 1024 * 1024
    
    files = []
    for f in os.listdir(BACKUP_DIR):
        if f.endswith(".sql"):
            path = os.path.join(BACKUP_DIR, f)
            stats = os.stat(path)
            files.append({
                "path": path,
                "size": stats.st_size,
                "ctime": stats.st_ctime
            })
    
    # Sort by time (oldest first)
    files.sort(key=lambda x: x["ctime"])
    
    total_size = sum(f["size"] for f in files)
    
    deleted_count = 0
    while total_size > limit_bytes and files:
        oldest = files.pop(0)
        try:
            os.remove(oldest["path"])
            total_size -= oldest["size"]
            deleted_count += 1
            print(f"Deleted old backup: {oldest['path']} (Retention policy)", flush=True)
        except Exception as e:
            print(f"Error deleting old backup: {e}", flush=True)
            break
            
    if deleted_count > 0:
        print(f"Pruned {deleted_count} old backups to stay within {limit_gb}GB limit.", flush=True)

def run_backup(db: Session = None):
    # If no DB session provided, we create one (for background task)
    from app.db.database import SessionLocal
    standalone_db = False
    if db is None:
        db = SessionLocal()
        standalone_db = True
    
    try:
        # Get config from admin user
        admin = db.query(User).filter(User.role == "admin").first()
        limit_gb = admin.backup_limit_gb if admin else 10
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"backup_{timestamp}.sql"
        filepath = os.path.join(BACKUP_DIR, filename)
        
        db_url = os.getenv("DATABASE_URL")
        
        # Prune before backup to ensure space
        prune_backups(limit_gb)
        
        # Using pg_dump
        command = f"pg_dump {db_url} > {filepath}"
        subprocess.run(command, shell=True, check=True)
        print(f"Backup created: {filename}", flush=True)
        return filename
    except Exception as e:
        print(f"Backup failed: {str(e)}", flush=True)
        return None
    finally:
        if standalone_db:
            db.close()

def run_restore(filename: str):
    filepath = os.path.join(BACKUP_DIR, filename)
    if not os.path.exists(filepath):
        return False
    
    db_url = os.getenv("DATABASE_URL")
    
    try:
        # Using psql to restore
        command = f"psql {db_url} < {filepath}"
        subprocess.run(command, shell=True, check=True)
        return True
    except Exception as e:
        print(f"Restore failed: {str(e)}")
        return False

@router.get("")
def list_backups(current_user: User = Depends(get_current_user)):
    backups = []
    if os.path.exists(BACKUP_DIR):
        for f in os.listdir(BACKUP_DIR):
            if f.endswith(".sql"):
                path = os.path.join(BACKUP_DIR, f)
                stats = os.stat(path)
                backups.append({
                    "filename": f,
                    "size": stats.st_size,
                    "created_at": datetime.fromtimestamp(stats.st_ctime).isoformat()
                })
    return sorted(backups, key=lambda x: x["created_at"], reverse=True)

@router.post("")
def create_backup(background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    background_tasks.add_task(run_backup)
    return {"message": "Backup iniciado en segundo plano."}

@router.post("/restore/{filename}")
def restore_backup(filename: str, current_user: User = Depends(get_current_user)):
    success = run_restore(filename)
    if success:
        return {"message": "Restauración completada con éxito."}
    else:
        raise HTTPException(status_code=500, detail="Error durante la restauración.")

@router.delete("/{filename}")
def delete_backup(filename: str, current_user: User = Depends(get_current_user)):
    filepath = os.path.join(BACKUP_DIR, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
        return {"message": "Archivo eliminado."}
    else:
        raise HTTPException(status_code=404, detail="Archivo no encontrado.")
