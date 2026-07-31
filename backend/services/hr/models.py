from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from ...database import Base
from datetime import datetime


class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=True)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)

    employee = relationship("backend.services.identity.models.User", backref="shifts")
    station = relationship("backend.services.station.models.Station", backref="shifts")
