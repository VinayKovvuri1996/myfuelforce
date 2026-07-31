from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ... import database
from ..identity import routes as identity_routes
from . import models, schemas

router = APIRouter(
    prefix="/stations",
    tags=["stations"]
)


@router.post("/", response_model=schemas.Station)
def create_station(
    station: schemas.StationCreate,
    db: Session = Depends(database.get_db),
    current_user=Depends(identity_routes.get_current_user),
):
    db_station = models.Station(
        name=station.name,
        location=station.location,
        owner_id=current_user.id,
    )
    db.add(db_station)
    db.commit()
    db.refresh(db_station)
    return db_station


@router.get("/", response_model=List[schemas.Station])
def read_stations(
    db: Session = Depends(database.get_db),
    current_user=Depends(identity_routes.get_current_user),
):
    return (
        db.query(models.Station)
        .filter(models.Station.owner_id == current_user.id)
        .all()
    )


@router.get("/{station_id}", response_model=schemas.Station)
def read_station(
    station_id: int,
    db: Session = Depends(database.get_db),
    current_user=Depends(identity_routes.get_current_user),
):
    station = (
        db.query(models.Station)
        .filter(models.Station.id == station_id, models.Station.owner_id == current_user.id)
        .first()
    )
    if station is None:
        raise HTTPException(status_code=404, detail="Station not found")
    return station
