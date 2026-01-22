import asyncpg
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from app.config import get_settings

logger = logging.getLogger(__name__)

# Global connection pool
_pool: asyncpg.Pool | None = None


async def init_db() -> None:
    """Initialize database connection pool."""
    global _pool
    settings = get_settings()
    
    if settings.app_env == "dev" and not settings.database_url.startswith("postgresql://"):
        logger.warning("Skipping database connection in dev mode without valid DATABASE_URL")
        return
    
    try:
        _pool = await asyncpg.create_pool(
            settings.database_url,
            min_size=2,
            max_size=10,
        )
        logger.info("Database connection pool initialized")
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        if settings.app_env != "dev":
            raise


async def close_db() -> None:
    """Close database connection pool."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


def get_pool() -> asyncpg.Pool:
    """Get database connection pool."""
    if _pool is None:
        raise RuntimeError("Database pool not initialized")
    return _pool


@asynccontextmanager
async def get_connection() -> AsyncGenerator[asyncpg.Connection, None]:
    """Get database connection from pool."""
    pool = get_pool()
    async with pool.acquire() as conn:
        yield conn
