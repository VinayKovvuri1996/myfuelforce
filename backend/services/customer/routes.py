from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ... import database
from . import models, schemas

router = APIRouter(
    prefix="/customers",
    tags=["customers"]
)


@router.post("", response_model=schemas.Customer)
@router.post("/", response_model=schemas.Customer, include_in_schema=False)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(database.get_db)):
    data = customer.model_dump()
    db_customer = models.Customer(**data)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer


@router.get("", response_model=List[schemas.Customer])
@router.get("/", response_model=List[schemas.Customer], include_in_schema=False)
def read_customers(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.Customer).offset(skip).limit(limit).all()


@router.get("/{customer_id}", response_model=schemas.Customer)
def read_customer(customer_id: int, db: Session = Depends(database.get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.put("/{customer_id}", response_model=schemas.Customer)
def update_customer(customer_id: int, customer: schemas.CustomerUpdate, db: Session = Depends(database.get_db)):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    for key, value in customer.model_dump(exclude_unset=True).items():
        setattr(db_customer, key, value)

    db.commit()
    db.refresh(db_customer)
    return db_customer
