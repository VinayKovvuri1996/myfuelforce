from sqlalchemy import Column, String, Boolean
from ...database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="dealer") # dealer, manager, staff
    is_active = Column(Boolean, default=True)
    
    # Profile Fields
    retail_outlet_name = Column(String)
    home_address = Column(String)
    state = Column(String)
    city = Column(String)
    district = Column(String)
    mandal = Column(String)
    village = Column(String)
    zipcode = Column(String)
    phone_number = Column(String, unique=True, index=True)
    contact_person = Column(String)
    supervisor = Column(String)
