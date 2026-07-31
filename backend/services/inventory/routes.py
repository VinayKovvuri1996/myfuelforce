from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ... import database
from ..identity import routes as identity_routes
from ..station import models as station_models
from . import models, schemas

router = APIRouter(
    prefix="/inventory",
    tags=["inventory"]
)


@router.post("/", response_model=schemas.Stock)
def create_stock(
    stock: schemas.StockCreate,
    db: Session = Depends(database.get_db),
    current_user=Depends(identity_routes.get_current_user),
):
    station = (
        db.query(station_models.Station)
        .filter(
            station_models.Station.id == stock.station_id,
            station_models.Station.owner_id == current_user.id,
        )
        .first()
    )
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    db_stock = models.Stock(**stock.model_dump())
    db.add(db_stock)
    db.commit()
    db.refresh(db_stock)
    return db_stock


@router.get("/", response_model=List[schemas.Stock])
def read_stocks(
    station_id: int | None = None,
    db: Session = Depends(database.get_db),
    current_user=Depends(identity_routes.get_current_user),
):
    query = (
        db.query(models.Stock)
        .join(station_models.Station)
        .filter(station_models.Station.owner_id == current_user.id)
    )
    if station_id is not None:
        query = query.filter(models.Stock.station_id == station_id)
    return query.all()


@router.put("/{stock_id}", response_model=schemas.Stock)
def update_stock(
    stock_id: int,
    stock: schemas.StockUpdate,
    db: Session = Depends(database.get_db),
    current_user=Depends(identity_routes.get_current_user),
):
    db_stock = (
        db.query(models.Stock)
        .join(station_models.Station)
        .filter(
            models.Stock.id == stock_id,
            station_models.Station.owner_id == current_user.id,
        )
        .first()
    )
    if db_stock is None:
        raise HTTPException(status_code=404, detail="Stock not found")

    for key, value in stock.model_dump(exclude_unset=True).items():
        setattr(db_stock, key, value)
    db_stock.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(db_stock)
    return db_stock
