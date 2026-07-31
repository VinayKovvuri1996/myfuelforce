from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, date, timezone
from ... import database
from ..sales import models as sales_models
from . import models, schemas

router = APIRouter(
    prefix="/inventory",
    tags=["inventory"]
)


def _today() -> date:
    return datetime.now(timezone.utc).date()


def _ensure_opening(stock: models.Stock, today: date):
    """Roll opening stock forward once per calendar day."""
    if stock.opening_date != today:
        stock.opening_quantity = stock.quantity or 0.0
        stock.opening_date = today


@router.get("", response_model=List[schemas.Stock])
@router.get("/", response_model=List[schemas.Stock], include_in_schema=False)
def read_stocks(db: Session = Depends(database.get_db)):
    today = _today()
    stocks = db.query(models.Stock).order_by(models.Stock.fuel_type).all()
    changed = False
    for s in stocks:
        before = s.opening_date
        _ensure_opening(s, today)
        if s.opening_date != before:
            changed = True
    if changed:
        db.commit()
        for s in stocks:
            db.refresh(s)
    return stocks


@router.post("", response_model=schemas.Stock)
@router.post("/", response_model=schemas.Stock, include_in_schema=False)
def upsert_stock(stock: schemas.StockCreate, db: Session = Depends(database.get_db)):
    today = _today()
    existing = (
        db.query(models.Stock)
        .filter(models.Stock.fuel_type == stock.fuel_type)
        .first()
    )
    if existing:
        _ensure_opening(existing, today)
        if stock.opening_quantity is not None:
            existing.opening_quantity = stock.opening_quantity
            existing.opening_date = today
            existing.quantity = stock.opening_quantity
        else:
            existing.quantity = stock.quantity
        existing.capacity = stock.capacity
        existing.unit = stock.unit
        existing.last_updated = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    opening = stock.opening_quantity if stock.opening_quantity is not None else stock.quantity
    db_stock = models.Stock(
        fuel_type=stock.fuel_type,
        unit=stock.unit,
        quantity=opening,
        capacity=stock.capacity,
        opening_quantity=opening,
        opening_date=today,
        station_id=stock.station_id,
        last_updated=datetime.utcnow(),
    )
    db.add(db_stock)
    db.commit()
    db.refresh(db_stock)
    return db_stock


@router.post("/receipt", response_model=schemas.Stock)
def add_receipt(receipt: schemas.StockReceipt, db: Session = Depends(database.get_db)):
    today = _today()
    stock = db.query(models.Stock).filter(models.Stock.fuel_type == receipt.fuel_type).first()
    if not stock:
        stock = models.Stock(
            fuel_type=receipt.fuel_type,
            unit=receipt.unit,
            quantity=0.0,
            opening_quantity=0.0,
            opening_date=today,
            capacity=receipt.capacity or 0.0,
        )
        db.add(stock)
        db.flush()

    _ensure_opening(stock, today)
    stock.quantity = (stock.quantity or 0.0) + receipt.quantity
    stock.unit = receipt.unit or stock.unit
    if receipt.capacity is not None:
        stock.capacity = receipt.capacity
    stock.last_updated = datetime.utcnow()

    db.add(
        models.StockLedger(
            fuel_type=receipt.fuel_type,
            entry_type="receipt",
            quantity=receipt.quantity,
            note=receipt.note,
        )
    )
    db.commit()
    db.refresh(stock)
    return stock


@router.get("/today", response_model=schemas.StockTodaySummary)
def stock_today(db: Session = Depends(database.get_db)):
    today = _today()
    stocks = db.query(models.Stock).order_by(models.Stock.fuel_type).all()
    rows: List[schemas.StockDayRow] = []

    for s in stocks:
        _ensure_opening(s, today)
        sales_qty = (
            db.query(func.coalesce(func.sum(sales_models.Sale.quantity_sold), 0.0))
            .filter(
                sales_models.Sale.product_type == s.fuel_type,
                func.date(sales_models.Sale.timestamp) == today,
            )
            .scalar()
        )
        receipts_qty = (
            db.query(func.coalesce(func.sum(models.StockLedger.quantity), 0.0))
            .filter(
                models.StockLedger.fuel_type == s.fuel_type,
                models.StockLedger.entry_type == "receipt",
                func.date(models.StockLedger.created_at) == today,
            )
            .scalar()
        )
        opening = s.opening_quantity or 0.0
        closing = opening + float(receipts_qty) - float(sales_qty)
        s.quantity = closing
        s.last_updated = datetime.utcnow()
        rows.append(
            schemas.StockDayRow(
                fuel_type=s.fuel_type,
                unit=s.unit or "Litre",
                opening_stock=opening,
                receipts_today=float(receipts_qty),
                sales_today=float(sales_qty),
                closing_stock=closing,
                capacity=s.capacity or 0.0,
            )
        )

    db.commit()
    return schemas.StockTodaySummary(business_date=today, rows=rows)


@router.put("/{stock_id}", response_model=schemas.Stock)
def update_stock(stock_id: int, stock: schemas.StockUpdate, db: Session = Depends(database.get_db)):
    db_stock = db.query(models.Stock).filter(models.Stock.id == stock_id).first()
    if db_stock is None:
        raise HTTPException(status_code=404, detail="Stock not found")

    today = _today()
    _ensure_opening(db_stock, today)
    data = stock.model_dump(exclude_unset=True)
    if "opening_quantity" in data:
        db_stock.opening_quantity = data["opening_quantity"]
        db_stock.opening_date = today
        if "quantity" not in data:
            db_stock.quantity = data["opening_quantity"]
    for key, value in data.items():
        if key == "opening_quantity":
            continue
        setattr(db_stock, key, value)
    db_stock.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(db_stock)
    return db_stock
