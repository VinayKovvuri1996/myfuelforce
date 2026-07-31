from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional


class SaleBase(BaseModel):
    customer_id: int
    product_type: str
    custom_product_name: Optional[str] = None
    unit: str
    price_per_unit: float
    quantity_sold: float
    total_amount: float
    bill_number: Optional[str] = None
    bill_date: Optional[date] = None
    supervisor_signed: Optional[str] = None
    bill_made_by: Optional[str] = None
    advance_cash: float = 0.0
    payment_mode: str = Field(default="Credit")  # Paid | Credit


class SaleCreate(SaleBase):
    pass


class Sale(SaleBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
