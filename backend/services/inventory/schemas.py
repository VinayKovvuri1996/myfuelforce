from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, List


class StockBase(BaseModel):
    fuel_type: str
    unit: str = "Litre"
    quantity: float = 0.0
    capacity: float = 0.0
    price_per_unit: float = 0.0
    station_id: Optional[int] = None


class StockCreate(StockBase):
    opening_quantity: Optional[float] = None


class StockUpdate(BaseModel):
    quantity: Optional[float] = None
    capacity: Optional[float] = None
    opening_quantity: Optional[float] = None
    unit: Optional[str] = None
    price_per_unit: Optional[float] = None


class Stock(StockBase):
    id: int
    opening_quantity: float = 0.0
    opening_date: Optional[date] = None
    last_updated: datetime

    class Config:
        from_attributes = True


class StockReceipt(BaseModel):
    fuel_type: str
    quantity: float
    unit: str = "Litre"
    note: Optional[str] = None
    capacity: Optional[float] = None


class StockDayRow(BaseModel):
    fuel_type: str
    unit: str
    opening_stock: float
    receipts_today: float
    sales_today: float
    closing_stock: float
    capacity: float
    price_per_unit: float = 0.0


class StockTodaySummary(BaseModel):
    business_date: date
    rows: List[StockDayRow]
