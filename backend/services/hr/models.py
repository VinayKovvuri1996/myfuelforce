from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from ...database import Base
from datetime import datetime


class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    # Free-text employee label (dealer staff name / code) — not a strict users FK
    user_id = Column(String, index=True)
    station_id = Column(Integer, nullable=True)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
