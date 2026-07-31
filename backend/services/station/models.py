from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ...database import Base


class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    owner_id = Column(String, ForeignKey("users.id"))

    owner = relationship("backend.services.identity.models.User", backref="stations")
