from database import engine, SessionLocal
import models
from sqlalchemy import text

# Intentionally create all
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    print("Testing query on Product...")
    game = db.query(models.Product).first()
    print("Query successful", game)
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
