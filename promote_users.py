from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend import models

SQLALCHEMY_DATABASE_URL = "postgresql://neondb_owner:npg_HZW8buEsSM1I@ep-nameless-leaf-almud22q-pooler.c-3.eu-central-1.aws.neon.tech/eneba-db?sslmode=require"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SessionLocal()
try:
    users = db.query(models.User).all()
    print(f"Promoting {len(users)} users to admin...")
    for u in users:
        u.role = "admin"
    db.commit()
    print("Promotion successful.")
finally:
    db.close()
