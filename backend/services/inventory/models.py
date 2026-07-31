from sqlalchemy import Column, Integer, String, Float, Date, DateTime, UniqueConstraint
from ...database import Base
from datetime import datetime


class Stock(Base):
    """Current live stock by fuel/product type (Indian retail fuels)."""

    __tablename__ = "stocks"
    __table_args__ = (UniqueConstraint("fuel_type", name="uq_stocks_fuel_type"),)

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, nullable=True)
    fuel_type = Column(String, index=True, nullable=False)
    unit = Column(String, default="Litre")
    quantity = Column(Float, default=0.0)  # current / closing stock
    capacity = Column(Float, default=0.0)
    opening_quantity = Column(Float, default=0.0)  # opening for current business day
    opening_date = Column(Date, nullable=True)
    price_per_unit = Column(Float, default=0.0)  # today's selling rate for this fuel
    last_updated = Column(DateTime, default=datetime.utcnow)


class StockLedger(Base):
    """Optional receipts/adjustments for audit."""

    __tablename__ = "stock_ledger"

    id = Column(Integer, primary_key=True, index=True)
    fuel_type = Column(String, index=True, nullable=False)
    entry_type = Column(String, default="receipt")  # receipt | adjustment | opening
    quantity = Column(Float, default=0.0)
    note = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
