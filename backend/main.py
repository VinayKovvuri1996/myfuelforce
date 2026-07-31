import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from . import database
from .services.identity import models as identity_models, routes as identity_routes
from .services.customer import models as customer_models, routes as customer_routes
from .services.inventory import models as inventory_models, routes as inventory_routes
from .services.sales import models as sales_models, routes as sales_routes
from .services.hr import models as hr_models, routes as hr_routes
from .services.station import models as station_models, routes as station_routes

# Create database tables (aggregating models from all services)
identity_models.Base.metadata.create_all(bind=database.engine)
station_models.Base.metadata.create_all(bind=database.engine)
customer_models.Base.metadata.create_all(bind=database.engine)
inventory_models.Base.metadata.create_all(bind=database.engine)
sales_models.Base.metadata.create_all(bind=database.engine)
hr_models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="FuelForce API Gateway")

cors_origins = os.getenv("CORS_ORIGINS", "*")
allow_origins = (
    ["*"]
    if cors_origins.strip() == "*"
    else [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(identity_routes.router)
app.include_router(customer_routes.router)
app.include_router(inventory_routes.router)
app.include_router(sales_routes.router)
app.include_router(hr_routes.router)
app.include_router(station_routes.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "FuelForce"}


_static_dir = Path(__file__).resolve().parent / "static"
_static_index = _static_dir / "index.html"


@app.get("/")
def read_root():
    if _static_index.exists():
        return FileResponse(_static_index)
    return {"message": "Welcome to FuelForce API Gateway"}


# Serve Angular production build when present (same-origin deploy on Render).
# Mount after API routes so /auth, /customers, etc. keep working.
if _static_dir.exists() and _static_index.exists():
    app.mount("/", StaticFiles(directory=_static_dir, html=True), name="frontend")
