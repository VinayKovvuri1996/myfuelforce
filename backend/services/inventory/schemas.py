from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class StockBase(BaseModel):
    station_id: int
    fuel_type: str
    quantity: float = 0.0
    capacity: float = 0.0


class StockCreate(StockBase):
    pass


class StockUpdate(BaseModel):
    quantity: Optional[float] = None
    capacity: Optional[float] = None


class Stock(StockBase):
    id: int
    last_updated: datetime

    class Config:
        from_attributes = True
