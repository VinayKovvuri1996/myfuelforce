from pydantic import BaseModel
from typing import Optional

class CustomerBase(BaseModel):
    name: str
    transport_company: str
    address: str
    phone_number: str
    email: str
    contact_person: str
    contact_person_details: Optional[str] = ""

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    transport_company: Optional[str] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    contact_person: Optional[str] = None
    contact_person_details: Optional[str] = None
    current_balance: Optional[float] = None

class Customer(CustomerBase):
    id: int
    current_balance: float

    class Config:
        from_attributes = True
