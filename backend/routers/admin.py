from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import get_current_admin
from .. import models, schemas

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users", response_model=List[schemas.UserResponse])
def get_all_users(
    db: Session = Depends(get_db), 
    current_admin: models.User = Depends(get_current_admin)
):
    """Lista todos los usuarios Registrados"""
    return db.query(models.User).all()

@router.get("/users/logged", response_model=List[schemas.UserResponse])
def get_logged_users(
    db: Session = Depends(get_db), 
    current_admin: models.User = Depends(get_current_admin)
):
    """Lista todos los usuarios que han hecho Login alguna vez"""
    return db.query(models.User).filter(models.User.last_login != None).all()
