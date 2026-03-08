import bcrypt
from sqlalchemy.orm import Session
from .database import SessionLocal, engine
from . import models

def get_password_hash(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def seed_users():
    db = SessionLocal()
    
    # Lista de usuarios a crear
    users_to_create = [
        {
            "email": "admin@eneba.com",
            "password": "admin123",
            "role": "admin"
        },
        {
            "email": "cliente@gmail.com",
            "password": "cliente123",
            "role": "client"
        }
    ]
    
    for user_data in users_to_create:
        existing_user = db.query(models.User).filter(models.User.email == user_data["email"]).first()
        if not existing_user:
            print(f"Creando usuario: {user_data['email']} ({user_data['role']})")
            hashed_pwd = get_password_hash(user_data["password"])
            new_user = models.User(
                email=user_data["email"],
                hashed_password=hashed_pwd,
                role=user_data["role"]
            )
            db.add(new_user)
        else:
            print(f"El usuario {user_data['email']} ya existe.")
            
    db.commit()
    db.close()

if __name__ == "__main__":
    # Asegurarse de que las tablas existan
    models.Base.metadata.create_all(bind=engine)
    seed_users()
    print("Seeding de usuarios completado.")
