"""Main FastAPI application entry point."""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from backend.config import settings
from backend.database import init_db, seed_default_data
from backend.routes.auth_routes import router as auth_router
from backend.routes.building_routes import router as building_router
from backend.routes.contract_routes import router as contract_router
from backend.routes.dashboard_routes import router as dashboard_router
from backend.routes.expense_routes import router as expense_router
from backend.routes.maintenance_routes import router as maintenance_router
from backend.routes.payment_routes import router as payment_router
from backend.routes.qr_routes import router as qr_router
from backend.routes.room_routes import router as room_router
from backend.routes.settings_routes import router as settings_router
from backend.routes.tenant_routes import router as tenant_router
from backend.routes.utility_routes import router as utility_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    await init_db()
    await seed_default_data()
    yield
    # Shutdown


app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(room_router)
app.include_router(tenant_router)
app.include_router(contract_router)
app.include_router(payment_router)
app.include_router(utility_router)
app.include_router(maintenance_router)
app.include_router(qr_router)
app.include_router(building_router)
app.include_router(expense_router)
app.include_router(settings_router)

# Static files and templates
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR / "static")), name="static")
templates = Jinja2Templates(directory=str(FRONTEND_DIR / "templates"))


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """Serve main application page."""
    return templates.TemplateResponse(
        request, "index.html"
    )


@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """Serve login page."""
    return templates.TemplateResponse(
        request, "login.html"
    )


@app.get("/scan/{qr_type}/{item_id}", response_class=HTMLResponse)
async def scan_page(request: Request, qr_type: str, item_id: int):
    """Serve QR scan result page (public)."""
    return templates.TemplateResponse(
        request,
        "scan.html",
        {"qr_type": qr_type, "item_id": item_id},
    )


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Handle 404 errors."""
    if request.url.path.startswith("/api/"):
        return JSONResponse(
            status_code=404,
            content={"detail": "រកមិនឃើញធនធាន"},
        )
    return templates.TemplateResponse(
        request, "index.html"
    )


@app.exception_handler(500)
async def server_error_handler(request: Request, exc):
    """Handle 500 errors."""
    return JSONResponse(
        status_code=500,
        content={"detail": "មានបញ្ហាក្នុងម៉ាស៊ីនមេ សូមព្យាយាមម្តងទៀត"},
    )
