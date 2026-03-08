from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .models import PlatformEnum

class ProductBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    discount: float = 0.0
    image_url: Optional[str] = None
    additional_images: Optional[str] = None # Lista de URLs en formato JSON o CSV
    platform: str # "PC, PS5", etc.
    stock: int = 0

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "client"

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    last_login: Optional[datetime] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    email: Optional[str] = None
