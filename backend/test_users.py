from backend.database import SessionLocal
from backend import models

db = SessionLocal()
try:
    users = db.query(models.User).all()
    for u in users:
        print(f"ID: {u.id}, Email: {u.email}, Hash: {u.hashed_password}, Role: {u.role}")
finally:
    db.close()
