from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import relationship
from ...database import Base
from datetime import datetime


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))

    # Product Details
    product_type = Column(String)  # Petrol, Diesel, CNG, Other
    custom_product_name = Column(String, nullable=True)
    unit = Column(String)
    price_per_unit = Column(Float)
    quantity_sold = Column(Float)
    total_amount = Column(Float)

    # Bill / payment details
    bill_number = Column(String, nullable=True, index=True)
    bill_date = Column(Date, nullable=True)
    supervisor_signed = Column(String, nullable=True)
    bill_made_by = Column(String, nullable=True)
    advance_cash = Column(Float, default=0.0)
    payment_mode = Column(String, default="Credit")
    # Credit | Cash | Cheque | Bank Transfer | RTGS | PhonePe | GPay
    cheque_number = Column(String, nullable=True)
    transaction_ref = Column(Text, nullable=True)  # UTR / UPI ref / transfer details

    timestamp = Column(DateTime, default=datetime.utcnow)

    customer = relationship("backend.services.customer.models.Customer", backref="sales")
