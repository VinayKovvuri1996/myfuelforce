from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from ...database import Base
from datetime import datetime


class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"))
    fuel_type = Column(String)
    quantity = Column(Float, default=0.0)
    capacity = Column(Float, default=0.0)
    last_updated = Column(DateTime, default=datetime.utcnow)

    station = relationship("backend.services.station.models.Station", backref="stocks")
