from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional, List


EMPLOYEE_ROLES: List[str] = [
    "Manager",
    "Supervisor",
    "Cashier",
    "Pump Boy",
    "Sweeper",
    "Helper",
    "Driver",
    "Co-Driver",
]


class EmployeeBase(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    contact_number: Optional[str] = None
    date_of_joining: Optional[date] = None
    address: Optional[str] = None
    role: str = "Helper"
    is_active: bool = True


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    contact_number: Optional[str] = None
    date_of_joining: Optional[date] = None
    address: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class Employee(EmployeeBase):
    id: int
    dealer_id: str

    class Config:
        from_attributes = True


class ShiftBase(BaseModel):
    start_time: datetime
    end_time: Optional[datetime] = None


class ShiftCreate(ShiftBase):
    user_id: Optional[str] = None
    employee_id: Optional[int] = None
    station_id: Optional[int] = None


class Shift(ShiftBase):
    id: int
    user_id: Optional[str] = None
    employee_id: Optional[int] = None
    station_id: Optional[int] = None

    class Config:
        from_attributes = True
