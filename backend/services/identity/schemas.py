from pydantic import BaseModel
from typing import Optional

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
