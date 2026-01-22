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
    
    try:
        # Remove query params (like sslmode) - asyncpg handles SSL separately
        dsn = settings.database_url.split('?')[0]
        ssl_setting = False if settings.app_env == "dev" else "prefer"
        
        _pool = await asyncpg.create_pool(
            dsn,
            min_size=2,
            max_size=10,
            ssl=ssl_setting,
        )
        logger.info("Database connection pool initialized")
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
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
