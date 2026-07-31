from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ShiftBase(BaseModel):
    start_time: datetime
    end_time: Optional[datetime] = None


class ShiftCreate(ShiftBase):
    user_id: str
    station_id: Optional[int] = None


class Shift(ShiftBase):
    id: int
    user_id: str
    station_id: Optional[int] = None

    class Config:
        from_attributes = True
