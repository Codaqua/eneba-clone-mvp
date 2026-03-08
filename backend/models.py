from sqlalchemy import Column, Integer, String, Float, Enum, DateTime
from .database import Base
import enum
from datetime import datetime

class PlatformEnum(str, enum.Enum):
    PC = "PC"
    PS5 = "PS5"
    Xbox = "Xbox"
    Switch = "Switch"

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    image_url = Column(String, nullable=True) # Imagen de portada
    additional_images = Column(String, nullable=True) # JSON array con más URLs
    platform = Column(String, nullable=False) # Ahora puede ser "PC, PS5, Xbox"
    stock = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="client") # 'client' or 'admin'
    last_login = Column(DateTime, nullable=True)
    client_id = Column(String, unique=True, index=True, nullable=True)
    client_secret = Column(String, nullable=True)
