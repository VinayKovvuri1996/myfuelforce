from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ... import database
from ..identity import routes as identity_routes
from ..station import models as station_models
from . import models, schemas

router = APIRouter(
    prefix="/manpower",
    tags=["manpower"]
)

@router.post("/shift/start", response_model=schemas.Shift)
def start_shift(shift: schemas.ShiftCreate, db: Session = Depends(database.get_db), current_user = Depends(identity_routes.get_current_user)):
    # Verify station ownership
    station = db.query(station_models.Station).filter(station_models.Station.id == shift.station_id, station_models.Station.owner_id == current_user.id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    db_shift = models.Shift(user_id=shift.user_id, station_id=shift.station_id, start_time=datetime.utcnow())
    db.add(db_shift)
    db.commit()
    db.refresh(db_shift)
    return db_shift

@router.put("/shift/end/{shift_id}", response_model=schemas.Shift)
def end_shift(shift_id: int, db: Session = Depends(database.get_db), current_user = Depends(identity_routes.get_current_user)):
    shift = db.query(models.Shift).filter(models.Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    
    # Verify ownership via station
    station = db.query(station_models.Station).filter(station_models.Station.id == shift.station_id, station_models.Station.owner_id == current_user.id).first()
    if not station:
        raise HTTPException(status_code=403, detail="Not authorized")

    shift.end_time = datetime.utcnow()
    db.commit()
    db.refresh(shift)
    return shift

@router.get("/shifts/{station_id}", response_model=List[schemas.Shift])
def read_shifts(station_id: int, db: Session = Depends(database.get_db), current_user = Depends(identity_routes.get_current_user)):
    # Verify station ownership
    station = db.query(station_models.Station).filter(station_models.Station.id == station_id, station_models.Station.owner_id == current_user.id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    shifts = db.query(models.Shift).filter(models.Shift.station_id == station_id).all()
    return shifts
