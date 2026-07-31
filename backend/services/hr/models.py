from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, Boolean, Text
from ...database import Base
from datetime import datetime


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    dealer_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    contact_number = Column(String, nullable=True)
    date_of_joining = Column(Date, nullable=True)
    address = Column(Text, nullable=True)
    role = Column(String, nullable=False, default="Helper")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    # Display label kept for older rows / quick lists
    user_id = Column(String, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True, index=True)
    station_id = Column(Integer, nullable=True)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
