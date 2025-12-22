from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    username: str
    email: str
    role: str = "dealer"

class UserCreate(UserBase):
    password: str
    retail_outlet_name: str
    home_address: str
    state: str
    city: str
    district: str
    mandal: str
    village: Optional[str] = None
    zipcode: str
    phone_number: str
    contact_person: str
    supervisor: str

class User(UserBase):
    id: str
    is_active: bool
    retail_outlet_name: Optional[str] = None
    home_address: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    mandal: Optional[str] = None
    village: Optional[str] = None
    zipcode: Optional[str] = None
    phone_number: Optional[str] = None
    contact_person: Optional[str] = None
    supervisor: Optional[str] = None

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Station Schemas
class StationBase(BaseModel):
    name: str
    location: str

class StationCreate(StationBase):
    pass

class Station(StationBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True

# Stock Schemas
class StockBase(BaseModel):
    fuel_type: str
    quantity: float
    capacity: float

class StockCreate(StockBase):
    pass

class Stock(StockBase):
    id: int
    station_id: int
    last_updated: datetime

    class Config:
        orm_mode = True

# Sale Schemas
class SaleBase(BaseModel):
    fuel_type: str
    quantity_sold: float
    amount: float

class SaleCreate(SaleBase):
    pass

class Sale(SaleBase):
    id: int
    station_id: int
    timestamp: datetime

    class Config:
        orm_mode = True

# Shift Schemas
class ShiftBase(BaseModel):
    start_time: datetime
    end_time: Optional[datetime] = None

class ShiftCreate(ShiftBase):
    user_id: int
    station_id: int

class Shift(ShiftBase):
    id: int
    user_id: int
    station_id: int

    class Config:
        orm_mode = True
