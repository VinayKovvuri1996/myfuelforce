from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, date, timedelta, timezone
from pydantic import BaseModel
from ... import database
from . import models, schemas
from ..customer import models as customer_models
from ..inventory import models as inventory_models

router = APIRouter(
    prefix="/sales",
    tags=["sales"]
)


def _utc_today() -> date:
    return datetime.now(timezone.utc).date()


def _range_bounds(start: date, end: date):
    """Inclusive start date, exclusive end+1 day as datetimes."""
    start_dt = datetime.combine(start, datetime.min.time())
    end_dt = datetime.combine(end + timedelta(days=1), datetime.min.time())
    return start_dt, end_dt


def _sum_sales(db: Session, start: date, end: date) -> dict:
    start_dt, end_dt = _range_bounds(start, end)
    amount, qty, count = (
        db.query(
            func.coalesce(func.sum(models.Sale.total_amount), 0.0),
            func.coalesce(func.sum(models.Sale.quantity_sold), 0.0),
            func.count(models.Sale.id),
        )
        .filter(models.Sale.timestamp >= start_dt, models.Sale.timestamp < end_dt)
        .one()
    )
    return {
        "amount": float(amount),
        "quantity": float(qty),
        "count": int(count),
        "start": start.isoformat(),
        "end": end.isoformat(),
    }


class AnalyticsResponse(BaseModel):
    today: dict
    yesterday: dict
    this_week: dict
    last_week: dict
    this_month: dict
    last_month: dict
    this_year: dict
    earlier: dict
    all_time: dict
    by_type_today: list
    daily_last_30: list


@router.post("", response_model=schemas.Sale)
@router.post("/", response_model=schemas.Sale, include_in_schema=False)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(database.get_db)):
    customer = (
        db.query(customer_models.Customer)
        .filter(customer_models.Customer.id == sale.customer_id)
        .first()
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    data = sale.model_dump()
    raw_mode = (data.get("payment_mode") or "Credit").strip()
    mode_map = {
        "credit": "Credit",
        "cash": "Cash",
        "cheque": "Cheque",
        "bank transfer": "Bank Transfer",
        "bank_transfer": "Bank Transfer",
        "rtgs": "RTGS",
        "phonepe": "PhonePe",
        "phone pe": "PhonePe",
        "gpay": "GPay",
        "google pay": "GPay",
        "paid": "Cash",  # legacy
    }
    mode = mode_map.get(raw_mode.lower(), None)
    if mode not in schemas.PAYMENT_MODES:
        raise HTTPException(
            status_code=400,
            detail=f"payment_mode must be one of: {', '.join(schemas.PAYMENT_MODES)}",
        )
    data["payment_mode"] = mode
    data["advance_cash"] = float(data.get("advance_cash") or 0.0)
    if data["advance_cash"] < 0:
        raise HTTPException(status_code=400, detail="advance_cash cannot be negative")

    if data.get("bill_number"):
        data["bill_number"] = str(data["bill_number"]).strip()
    for key in ("supervisor_signed", "bill_made_by", "cheque_number", "transaction_ref"):
        if data.get(key):
            data[key] = str(data[key]).strip()
        else:
            data[key] = data.get(key) or None

    if mode == "Cheque" and not data.get("cheque_number"):
        raise HTTPException(status_code=400, detail="Cheque number is required for Cheque payments")
    if mode in ("Bank Transfer", "RTGS", "PhonePe", "GPay") and not data.get("transaction_ref"):
        raise HTTPException(
            status_code=400,
            detail="Transaction ID / details are required for this payment mode",
        )

    db_sale = models.Sale(**data)
    db.add(db_sale)

    # Only Credit increases outstanding (minus cash advance against this bill).
    if mode == "Credit":
        due = max(0.0, float(sale.total_amount) - data["advance_cash"])
        customer.current_balance = (customer.current_balance or 0.0) + due

    # Deduct from stock by product type (skip Other unless stock row exists)
    fuel = sale.custom_product_name if sale.product_type == "Other" and sale.custom_product_name else sale.product_type
    stock = (
        db.query(inventory_models.Stock)
        .filter(inventory_models.Stock.fuel_type == fuel)
        .first()
    )
    if stock:
        today = _utc_today()
        if stock.opening_date != today:
            stock.opening_quantity = stock.quantity or 0.0
            stock.opening_date = today
        stock.quantity = (stock.quantity or 0.0) - sale.quantity_sold
        stock.last_updated = datetime.utcnow()

    db.commit()
    db.refresh(db_sale)
    return db_sale


@router.get("", response_model=List[schemas.Sale])
@router.get("/", response_model=List[schemas.Sale], include_in_schema=False)
def read_sales(skip: int = 0, limit: int = 500, db: Session = Depends(database.get_db)):
    return (
        db.query(models.Sale)
        .order_by(models.Sale.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/analytics", response_model=AnalyticsResponse)
def sales_analytics(db: Session = Depends(database.get_db)):
    today = _utc_today()
    yesterday = today - timedelta(days=1)

    # Week: Monday-Sunday (ISO)
    this_week_start = today - timedelta(days=today.weekday())
    last_week_start = this_week_start - timedelta(days=7)
    last_week_end = this_week_start - timedelta(days=1)

    this_month_start = today.replace(day=1)
    if this_month_start.month == 1:
        last_month_start = this_month_start.replace(year=this_month_start.year - 1, month=12)
    else:
        last_month_start = this_month_start.replace(month=this_month_start.month - 1)
    last_month_end = this_month_start - timedelta(days=1)

    this_year_start = today.replace(month=1, day=1)
    earlier_end = this_year_start - timedelta(days=1)

    all_time_start = date(2000, 1, 1)

    by_type = (
        db.query(
            models.Sale.product_type,
            func.coalesce(func.sum(models.Sale.total_amount), 0.0),
            func.coalesce(func.sum(models.Sale.quantity_sold), 0.0),
        )
        .filter(func.date(models.Sale.timestamp) == today)
        .group_by(models.Sale.product_type)
        .all()
    )

    daily = []
    for i in range(29, -1, -1):
        d = today - timedelta(days=i)
        bucket = _sum_sales(db, d, d)
        daily.append({"date": d.isoformat(), "amount": bucket["amount"], "quantity": bucket["quantity"], "count": bucket["count"]})

    earlier = _sum_sales(db, all_time_start, earlier_end) if earlier_end >= all_time_start else {
        "amount": 0.0, "quantity": 0.0, "count": 0, "start": None, "end": None
    }

    return AnalyticsResponse(
        today=_sum_sales(db, today, today),
        yesterday=_sum_sales(db, yesterday, yesterday),
        this_week=_sum_sales(db, this_week_start, today),
        last_week=_sum_sales(db, last_week_start, last_week_end),
        this_month=_sum_sales(db, this_month_start, today),
        last_month=_sum_sales(db, last_month_start, last_month_end),
        this_year=_sum_sales(db, this_year_start, today),
        earlier=earlier,
        all_time=_sum_sales(db, all_time_start, today),
        by_type_today=[
            {"product_type": t, "amount": float(a), "quantity": float(q)} for t, a, q in by_type
        ],
        daily_last_30=daily,
    )


@router.get("/customer/{customer_id}", response_model=List[schemas.Sale])
def read_customer_sales(customer_id: int, db: Session = Depends(database.get_db)):
    return db.query(models.Sale).filter(models.Sale.customer_id == customer_id).all()
