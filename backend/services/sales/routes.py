from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ... import database
from . import models, schemas
from ..customer import models as customer_models

router = APIRouter(
    prefix="/sales",
    tags=["sales"]
)

@router.post("/", response_model=schemas.Sale)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(database.get_db)):
    # 1. Verify Customer exists
    customer = db.query(customer_models.Customer).filter(customer_models.Customer.id == sale.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # 2. Create Sale Record
    db_sale = models.Sale(**sale.dict())
    db.add(db_sale)
    
    # 3. Update Customer Balance
    # Assuming 'total_amount' is what the customer owes for this transaction
    customer.current_balance += sale.total_amount
    
    db.commit()
    db.refresh(db_sale)
    return db_sale

@router.get("/", response_model=List[schemas.Sale])
def read_sales(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    sales = db.query(models.Sale).offset(skip).limit(limit).all()
    return sales

@router.get("/customer/{customer_id}", response_model=List[schemas.Sale])
def read_customer_sales(customer_id: int, db: Session = Depends(database.get_db)):
    sales = db.query(models.Sale).filter(models.Sale.customer_id == customer_id).all()
    return sales
