import sys
from sqlalchemy import create_engine

url = "postgresql://neondb_owner:npg_HZW8buEsSM1I@ep-nameless-leaf-almud22q-pooler.c-3.eu-central-1.aws.neon.tech/eneba-db?sslmode=require"
engine = create_engine(url)

try:
    with engine.connect() as conn:
        print("Connection successful!")
except Exception as e:
    print(f"Error: {e}")
