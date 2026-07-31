from pydantic import BaseModel
from typing import Optional


class StationBase(BaseModel):
    name: str
    location: str


class StationCreate(StationBase):
    pass


class Station(StationBase):
    id: int
    owner_id: str

    class Config:
        from_attributes = True
