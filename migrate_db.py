from sqlalchemy import create_engine, text

SQLALCHEMY_DATABASE_URL = "postgresql://neondb_owner:npg_HZW8buEsSM1I@ep-nameless-leaf-almud22q-pooler.c-3.eu-central-1.aws.neon.tech/eneba-db?sslmode=require"
engine = create_engine(SQLALCHEMY_DATABASE_URL)

with engine.connect() as conn:
    print("Migrating users table...")
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN last_login TIMESTAMP"))
        print("Added last_login")
    except Exception as e:
        print(f"last_login might already exist or error: {e}")
        
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN client_id VARCHAR"))
        conn.execute(text("CREATE INDEX ix_users_client_id ON users (client_id)"))
        print("Added client_id")
    except Exception as e:
        print(f"client_id might already exist or error: {e}")
        
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN client_secret VARCHAR"))
        print("Added client_secret")
    except Exception as e:
        print(f"client_secret might already exist or error: {e}")
        
    conn.commit()
    print("Migration finished.")
