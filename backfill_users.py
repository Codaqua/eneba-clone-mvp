from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend import models
import uuid

SQLALCHEMY_DATABASE_URL = "postgresql://neondb_owner:npg_HZW8buEsSM1I@ep-nameless-leaf-almud22q-pooler.c-3.eu-central-1.aws.neon.tech/eneba-db?sslmode=require"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SessionLocal()
try:
    users = db.query(models.User).all()
    print(f"Updating {len(users)} users with client identity...")
    for u in users:
        if not u.client_id:
            u.client_id = str(uuid.uuid4())
        if not u.client_secret:
            u.client_secret = str(uuid.uuid4()).replace("-", "")
    db.commit()
    print("Update successful.")
finally:
    db.close()
