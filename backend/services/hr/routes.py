from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from ... import database
from ..identity import routes as identity_routes
from . import models, schemas

router = APIRouter(
    prefix="/manpower",
    tags=["manpower"]
)


def _normalize_role(role: Optional[str]) -> str:
    if not role:
        return "Helper"
    cleaned = role.strip()
    for allowed in schemas.EMPLOYEE_ROLES:
        if cleaned.lower() == allowed.lower():
            return allowed
    raise HTTPException(
        status_code=400,
        detail=f"Invalid role. Choose one of: {', '.join(schemas.EMPLOYEE_ROLES)}"
    )


def _employee_display_name(emp: models.Employee) -> str:
    return f"{emp.first_name} {emp.last_name}".strip()


# --- Employees ---

@router.get("/roles", response_model=List[str])
def list_roles(current_user=Depends(identity_routes.get_current_user)):
    return schemas.EMPLOYEE_ROLES


@router.post("/employees", response_model=schemas.Employee)
@router.post("/employees/", response_model=schemas.Employee, include_in_schema=False)
def create_employee(
    payload: schemas.EmployeeCreate,
    db: Session = Depends(database.get_db),
    current_user=Depends(identity_routes.get_current_user),
):
    data = payload.model_dump()
    data["role"] = _normalize_role(data.get("role"))
    data["first_name"] = data["first_name"].strip()
    data["last_name"] = data["last_name"].strip()
    if data.get("contact_number"):
        data["contact_number"] = data["contact_number"].strip()
    emp = models.Employee(dealer_id=current_user.id, **data)
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp


@router.get("/employees", response_model=List[schemas.Employee])
@router.get("/employees/", response_model=List[schemas.Employee], include_in_schema=False)
def list_employees(
    db: Session = Depends(database.get_db),
    current_user=Depends(identity_routes.get_current_user),
):
    return (
        db.query(models.Employee)
        .filter(models.Employee.dealer_id == current_user.id)
        .order_by(models.Employee.first_name.asc(), models.Employee.last_name.asc())
        .all()
    )


@router.get("/employees/{employee_id}", response_model=schemas.Employee)
def get_employee(
    employee_id: int,
    db: Session = Depends(database.get_db),
    current_user=Depends(identity_routes.get_current_user),
):
    emp = (
        db.query(models.Employee)
        .filter(models.Employee.id == employee_id, models.Employee.dealer_id == current_user.id)
        .first()
    )
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp


@router.put("/employees/{employee_id}", response_model=schemas.Employee)
def update_employee(
    employee_id: int,
    payload: schemas.EmployeeUpdate,
    db: Session = Depends(database.get_db),
    current_user=Depends(identity_routes.get_current_user),
):
    emp = (
        db.query(models.Employee)
        .filter(models.Employee.id == employee_id, models.Employee.dealer_id == current_user.id)
        .first()
    )
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    data = payload.model_dump(exclude_unset=True)
    if "role" in data:
        data["role"] = _normalize_role(data["role"])
    for key in ("first_name", "last_name", "contact_number"):
        if key in data and isinstance(data[key], str):
            data[key] = data[key].strip()
    for key, value in data.items():
        setattr(emp, key, value)

    db.commit()
    db.refresh(emp)
    return emp


# --- Shifts ---

class ShiftStartRequest(BaseModel):
    user_id: Optional[str] = None
    employee_id: Optional[int] = None
    station_id: Optional[int] = None
    start_time: Optional[datetime] = None


@router.post("/shift/start", response_model=schemas.Shift)
def start_shift(
    shift: ShiftStartRequest,
    db: Session = Depends(database.get_db),
    current_user=Depends(identity_routes.get_current_user),
):
    display_name = (shift.user_id or "").strip() or None
    employee_id = shift.employee_id

    if employee_id:
        emp = (
            db.query(models.Employee)
            .filter(models.Employee.id == employee_id, models.Employee.dealer_id == current_user.id)
            .first()
        )
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")
        if not emp.is_active:
            raise HTTPException(status_code=400, detail="Employee is inactive")
        display_name = _employee_display_name(emp)
    elif not display_name:
        raise HTTPException(status_code=400, detail="Select an employee or enter a name")

    db_shift = models.Shift(
        user_id=display_name,
        employee_id=employee_id,
        station_id=shift.station_id,
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

    shift.end_time = datetime.utcnow()
    db.commit()
    db.refresh(shift)
    return shift


@router.get("/shifts", response_model=List[schemas.Shift])
def read_all_shifts(
    db: Session = Depends(database.get_db),
    current_user=Depends(identity_routes.get_current_user),
):
    dealer_emp_ids = [
        row.id
        for row in db.query(models.Employee.id)
        .filter(models.Employee.dealer_id == current_user.id)
        .all()
    ]
    if not dealer_emp_ids:
        return []
    return (
        db.query(models.Shift)
        .filter(models.Shift.employee_id.in_(dealer_emp_ids))
        .order_by(models.Shift.start_time.desc())
        .limit(200)
        .all()
    )


@router.get("/shifts/{station_id}", response_model=List[schemas.Shift])
def read_shifts(
    station_id: int,
    db: Session = Depends(database.get_db),
    current_user=Depends(identity_routes.get_current_user),
):
    return db.query(models.Shift).filter(models.Shift.station_id == station_id).all()
