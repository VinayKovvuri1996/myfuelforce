from sqlalchemy import Column, Integer, String, Float, ForeignKey
from ...database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    transport_company = Column(String)
    address = Column(String)
    phone_number = Column(String)
    email = Column(String)
    contact_person = Column(String)
    contact_person_details = Column(String)
    current_balance = Column(Float, default=0.0)
    
    # owner_id = Column(String, ForeignKey("users.id")) # Optional: Link to Dealer
