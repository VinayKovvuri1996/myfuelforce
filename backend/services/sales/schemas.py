from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SaleBase(BaseModel):
    customer_id: int
    product_type: str
    custom_product_name: Optional[str] = None
    unit: str
    price_per_unit: float
    quantity_sold: float
    total_amount: float

class SaleCreate(SaleBase):
    pass

class Sale(SaleBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
