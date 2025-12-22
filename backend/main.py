from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import database
from .services.identity import models as identity_models, routes as identity_routes
from .services.customer import models as customer_models, routes as customer_routes
from .services.inventory import models as inventory_models, routes as inventory_routes
from .services.sales import models as sales_models, routes as sales_routes
from .services.hr import models as hr_models, routes as hr_routes

# Create database tables (Aggregating models from all services)
# In a real microservice setup, each service would manage its own DB migrations.
identity_models.Base.metadata.create_all(bind=database.engine)
customer_models.Base.metadata.create_all(bind=database.engine)
inventory_models.Base.metadata.create_all(bind=database.engine)
sales_models.Base.metadata.create_all(bind=database.engine)
hr_models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="FuelForce API Gateway")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Service Routers
app.include_router(identity_routes.router)
app.include_router(customer_routes.router)
app.include_router(inventory_routes.router)
app.include_router(sales_routes.router)
app.include_router(hr_routes.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to FuelForce API Gateway"}
