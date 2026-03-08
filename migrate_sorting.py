from sqlalchemy import create_engine, text

# Connection string from database.py / migrate_db.py
SQLALCHEMY_DATABASE_URL = "postgresql://neondb_owner:npg_HZW8buEsSM1I@ep-nameless-leaf-almud22q-pooler.c-3.eu-central-1.aws.neon.tech/eneba-db?sslmode=require"
engine = create_engine(SQLALCHEMY_DATABASE_URL)

def run_migration():
    with engine.connect() as conn:
        print("Migrating products table for sorting...")
        
        # 1. Add updated_at column
        try:
            # We add it with a default of NOW() so existing products have a timestamp
            conn.execute(text("ALTER TABLE products ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
            print("Successfully added column 'updated_at'")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("Column 'updated_at' already exists.")
            else:
                print(f"Error adding 'updated_at': {e}")
        
        conn.commit()
        print("Migration finished successfully.")

if __name__ == "__main__":
    run_migration()
