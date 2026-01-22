from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db, close_db
from app.routers import repos


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
    settings = get_settings()
    
    # #region agent log
    import json; open(r'c:\Dev\new_folio\.cursor\debug.log','a').write(json.dumps({"location":"main.py:create_app","message":"CORS config","data":{"cors_origins":settings.cors_origins_list},"timestamp":__import__('time').time()*1000,"sessionId":"debug-session","hypothesisId":"H1"})+'\n')
    # #endregion
    
    app = FastAPI(
        title="Portfolio API",
        description="GitHub repository auto-sync for portfolio",
        version="1.0.0",
        lifespan=lifespan,
    )
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(repos.router, prefix="/api")
    
    # Health check endpoint
    @app.get("/health")
    async def health_check():
        return {"status": "healthy"}
    
    return app


app = create_app()
