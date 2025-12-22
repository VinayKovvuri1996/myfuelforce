from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # Changed to String for custom ID
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="dealer") # dealer, manager, staff
    is_active = Column(Boolean, default=True)
    
    # New Fields
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

    stations = relationship("Station", back_populates="owner")
    shifts = relationship("Shift", back_populates="employee")

class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    owner_id = Column(String, ForeignKey("users.id"))

    owner = relationship("User", back_populates="stations")
    stocks = relationship("Stock", back_populates="station")
    sales = relationship("Sale", back_populates="station")
    shifts = relationship("Shift", back_populates="station")

class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"))
    fuel_type = Column(String) # Petrol, Diesel, etc.
    quantity = Column(Float)
    capacity = Column(Float)
    last_updated = Column(DateTime, default=datetime.utcnow)

    station = relationship("Station", back_populates="stocks")

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"))
    fuel_type = Column(String)
    quantity_sold = Column(Float)
    amount = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

    station = relationship("Station", back_populates="sales")

class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    station_id = Column(Integer, ForeignKey("stations.id"))
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    
    employee = relationship("User", back_populates="shifts")
    station = relationship("Station", back_populates="shifts")
