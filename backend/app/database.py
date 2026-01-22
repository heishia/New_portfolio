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
        # Replace localhost with 127.0.0.1 to avoid DNS resolution issues on Windows
        dsn = dsn.replace('@localhost:', '@127.0.0.1:')
        ssl_setting = False if settings.app_env == "dev" else "prefer"
        
        print(f"Connecting to database: {dsn[:dsn.find('@')]}@***")
        
        _pool = await asyncpg.create_pool(
            dsn,
            min_size=1,
            max_size=10,
            ssl=ssl_setting,
            command_timeout=60,
        )
        print("Database connection pool initialized successfully!")
    except Exception as e:
        print(f"Failed to connect to database: {e}")
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
