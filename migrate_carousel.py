from sqlalchemy import create_engine, text
import json

# Connection string from database.py / migrate_db.py
SQLALCHEMY_DATABASE_URL = "postgresql://neondb_owner:npg_HZW8buEsSM1I@ep-nameless-leaf-almud22q-pooler.c-3.eu-central-1.aws.neon.tech/eneba-db?sslmode=require"
engine = create_engine(SQLALCHEMY_DATABASE_URL)

def run_migration():
    with engine.connect() as conn:
        print("Migrating products table...")
        
        # 1. Add additional_images
        try:
            conn.execute(text("ALTER TABLE products ADD COLUMN additional_images TEXT"))
            print("Successfully added column 'additional_images'")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("Column 'additional_images' already exists.")
            else:
                print(f"Error adding 'additional_images': {e}")
        
        # 2. Convert platform from Enum to VARCHAR
        try:
            # PostgreSQL requires casting if there are existing rows or to allow transition from Enum type.
            # Usually, you can alter type directly.
            conn.execute(text("ALTER TABLE products ALTER COLUMN platform TYPE VARCHAR(255)"))
            print("Successfully converted 'platform' to VARCHAR")
        except Exception as e:
            print(f"Error converting 'platform' type: {e}")
            
        conn.commit()
        print("Migration finished successfully.")

if __name__ == "__main__":
    run_migration()
