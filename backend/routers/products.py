from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import get_current_admin
from .. import models, schemas

router = APIRouter(prefix="/products", tags=["products"])

@router.get("", response_model=List[schemas.Product])
def get_products(
    platform: Optional[str] = Query(None, description="Filter by platform"),
    price_min: Optional[float] = Query(None, description="Minimum price filter"),
    price_max: Optional[float] = Query(None, description="Maximum price filter"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Product)
    
    if platform:
        query = query.filter(models.Product.platform.contains(platform))
    if price_min is not None:
        query = query.filter(models.Product.price >= price_min)
    if price_max is not None:
        query = query.filter(models.Product.price <= price_max)
        
    return query.order_by(models.Product.updated_at.desc()).all()

@router.get("/{product_id}", response_model=schemas.Product)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("", response_model=schemas.Product)
def create_product(
    product: schemas.ProductCreate, 
    db: Session = Depends(get_db), 
    current_admin: models.User = Depends(get_current_admin)
):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int, 
    product_update: schemas.ProductCreate, 
    db: Session = Depends(get_db), 
    current_admin: models.User = Depends(get_current_admin)
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product_update.dict().items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/{product_id}")
def delete_product(
    product_id: int, 
    db: Session = Depends(get_db), 
    current_admin: models.User = Depends(get_current_admin)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"ok": True}
