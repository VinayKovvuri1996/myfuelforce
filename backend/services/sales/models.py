from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from ...database import Base
from datetime import datetime

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    
    # Product Details
    product_type = Column(String) # Petrol, Diesel, CNG, Other
    custom_product_name = Column(String, nullable=True) # If Other
    unit = Column(String) # Ltr, Kg, etc.
    price_per_unit = Column(Float)
    quantity_sold = Column(Float)
    total_amount = Column(Float)
    
    timestamp = Column(DateTime, default=datetime.utcnow)

    customer = relationship("backend.services.customer.models.Customer", backref="sales")
