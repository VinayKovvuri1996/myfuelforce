import os
from pathlib import Path

from fastapi import FastAPI, APIRouter, HTTPException
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
_ASSET_SUFFIXES = {
    ".js",
    ".css",
    ".map",
    ".ico",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".svg",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".json",
    ".txt",
}


def _is_under_static(path: Path) -> bool:
    try:
        path.resolve().relative_to(_static_dir.resolve())
        return True
    except ValueError:
        return False


def _file_response(path: Path, *, no_cache: bool = False) -> FileResponse:
    headers = {}
    if no_cache:
        headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        headers["Pragma"] = "no-cache"
        headers["Expires"] = "0"
    elif path.suffix.lower() in {".js", ".css", ".woff", ".woff2"}:
        # Fingerprinted Angular bundles are safe to cache hard.
        headers["Cache-Control"] = "public, max-age=31536000, immutable"
    return FileResponse(path, headers=headers)


def _spa_index() -> FileResponse:
    return _file_response(_static_index, no_cache=True)


@app.get("/")
@app.head("/")
def read_root():
    if _static_index.exists():
        return _spa_index()
    return {"message": "Welcome to FuelForce API Gateway"}


if _static_dir.exists() and _static_index.exists():

    @app.get("/{full_path:path}")
    @app.head("/{full_path:path}")
    def spa_fallback(full_path: str):
        """Serve Angular UI for non-API routes.

        Missing fingerprinted assets must 404 (not return index.html). Returning
        HTML for /main-OLDHASH.js breaks browsers that still have a cached
        index.html pointing at a previous deploy.
        """
        if full_path == "api" or full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")

        candidate = (_static_dir / full_path).resolve()
        if not _is_under_static(candidate):
            raise HTTPException(status_code=404, detail="Not found")

        if candidate.is_file():
            return _file_response(candidate)

        # Never SPA-fallback asset-looking paths — force a real cache miss.
        suffix = Path(full_path).suffix.lower()
        if suffix in _ASSET_SUFFIXES or full_path.startswith("assets/"):
            raise HTTPException(status_code=404, detail="Asset not found")

        return _spa_index()
