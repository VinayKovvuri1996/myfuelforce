from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from ... import database
from ..identity import routes as identity_routes
from ..station import models as station_models
from . import models, schemas

router = APIRouter(
    prefix="/manpower",
    tags=["manpower"]
)


class ShiftStartRequest(BaseModel):
    user_id: str
    station_id: Optional[int] = None
    start_time: Optional[datetime] = None


@router.post("/shift/start", response_model=schemas.Shift)
def start_shift(
    shift: ShiftStartRequest,
    db: Session = Depends(database.get_db),
    current_user=Depends(identity_routes.get_current_user),
):
    station_id = shift.station_id
    if station_id is not None:
        station = (
            db.query(station_models.Station)
            .filter(
                station_models.Station.id == station_id,
                station_models.Station.owner_id == current_user.id,
            )
            .first()
        )
        if not station:
            raise HTTPException(status_code=404, detail="Station not found")

    db_shift = models.Shift(
        user_id=shift.user_id or current_user.id,
        station_id=station_id,
        start_time=shift.start_time or datetime.utcnow(),
    )
    db.add(db_shift)
    db.commit()
    db.refresh(db_shift)
    return db_shift


@router.post("/shift/end/{shift_id}", response_model=schemas.Shift)
@router.put("/shift/end/{shift_id}", response_model=schemas.Shift)
def end_shift(
    shift_id: int,
    db: Session = Depends(database.get_db),
    current_user=Depends(identity_routes.get_current_user),
):
    shift = db.query(models.Shift).filter(models.Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")

    if shift.station_id is not None:
        station = (
            db.query(station_models.Station)
            .filter(
                station_models.Station.id == shift.station_id,
                station_models.Station.owner_id == current_user.id,
            )
            .first()
        )
        if not station:
            raise HTTPException(status_code=403, detail="Not authorized")

    shift.end_time = datetime.utcnow()
    db.commit()
    db.refresh(shift)
    return shift


@router.get("/shifts", response_model=List[schemas.Shift])
def read_all_shifts(
    db: Session = Depends(database.get_db),
    current_user=Depends(identity_routes.get_current_user),
):
    return db.query(models.Shift).order_by(models.Shift.start_time.desc()).limit(200).all()


@router.get("/shifts/{station_id}", response_model=List[schemas.Shift])
def read_shifts(
    station_id: int,
    db: Session = Depends(database.get_db),
    current_user=Depends(identity_routes.get_current_user),
):
    station = (
        db.query(station_models.Station)
        .filter(
            station_models.Station.id == station_id,
            station_models.Station.owner_id == current_user.id,
        )
        .first()
    )
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    shifts = db.query(models.Shift).filter(models.Shift.station_id == station_id).all()
    return shifts
