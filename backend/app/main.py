from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db, close_db
from app.routers import repos, auth, analytics, upload, settings, project_requests


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown."""
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    app_settings = get_settings()
    
    # Debug: print CORS origins
    print(f"CORS origins configured: {app_settings.cors_origins_list}")
    
    app = FastAPI(
        title="Portfolio API",
        description="GitHub repository auto-sync for portfolio",
        version="1.0.0",
        lifespan=lifespan,
    )
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=app_settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(repos.router, prefix="/api")
    app.include_router(auth.router, prefix="/api")
    app.include_router(analytics.router, prefix="/api")
    app.include_router(upload.router, prefix="/api")
    app.include_router(settings.router, prefix="/api")
    app.include_router(project_requests.router, prefix="/api")
    
    # Health check endpoint
    @app.get("/health")
    async def health_check():
        return {"status": "healthy"}
    
    return app


app = create_app()
