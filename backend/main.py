import os
from pathlib import Path

from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from . import database
from .schema_fix import ensure_schema
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
ensure_schema()

app = FastAPI(title="FuelForce API Gateway", redirect_slashes=False)

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

# All JSON APIs live under /api so Angular routes like /customers and /sales can serve the UI.
api = APIRouter(prefix="/api")
api.include_router(identity_routes.router)
api.include_router(customer_routes.router)
api.include_router(inventory_routes.router)
api.include_router(sales_routes.router)
api.include_router(hr_routes.router)
api.include_router(station_routes.router)


@api.get("/health")
def health():
    return {"status": "ok", "service": "FuelForce"}


app.include_router(api)

_static_dir = Path(__file__).resolve().parent / "static"
_static_index = _static_dir / "index.html"


@app.get("/")
def read_root():
    if _static_index.exists():
        return FileResponse(_static_index)
    return {"message": "Welcome to FuelForce API Gateway"}


if _static_dir.exists() and _static_index.exists():

    @app.get("/{full_path:path}")
    def spa_fallback(full_path: str):
        """Serve Angular UI for all non-file routes (API is only under /api)."""
        if full_path == "api" or full_path.startswith("api/"):
            from fastapi import HTTPException

            raise HTTPException(status_code=404, detail="Not found")

        candidate = _static_dir / full_path
        if candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(_static_index)
