import asyncpg
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from app.config import get_settings

logger = logging.getLogger(__name__)

# Global connection pool
_pool: asyncpg.Pool | None = None

# Database schema
SCHEMA_SQL = """
-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Repositories table
CREATE TABLE IF NOT EXISTS repositories (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    description TEXT,
    html_url VARCHAR(500),
    language VARCHAR(100),
    stargazers_count INTEGER DEFAULT 0,
    topics TEXT[],
    github_created_at TIMESTAMP,
    github_updated_at TIMESTAMP,
    -- Portfolio metadata
    title VARCHAR(255),
    subtitle VARCHAR(500),
    project_type JSONB DEFAULT '[]',
    detailed_description TEXT,
    features JSONB DEFAULT '[]',
    technologies JSONB DEFAULT '[]',
    screenshots JSONB DEFAULT '[]',
    challenges TEXT,
    achievements TEXT,
    priority INTEGER DEFAULT 0,
    roles JSONB DEFAULT '[]',
    client_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'completed',
    start_date DATE,
    end_date DATE,
    is_ongoing BOOLEAN DEFAULT FALSE,
    demo_url VARCHAR(500),
    documentation_url VARCHAR(500),
    cover_image VARCHAR(500),
    is_visible BOOLEAN DEFAULT TRUE,
    -- Metrics
    lines_of_code INTEGER,
    commit_count INTEGER,
    contributor_count INTEGER DEFAULT 1,
    languages JSONB DEFAULT '{}',
    -- Architecture details
    architecture TEXT,
    system_components JSONB DEFAULT '[]',
    core_principles JSONB DEFAULT '[]',
    auth_flow JSONB DEFAULT '[]',
    data_models JSONB DEFAULT '[]',
    technical_challenges JSONB DEFAULT '[]',
    key_achievements JSONB DEFAULT '[]',
    code_snippets JSONB DEFAULT '[]',
    -- Cache info
    has_portfolio_meta BOOLEAN DEFAULT FALSE,
    cached_at TIMESTAMP DEFAULT NOW()
);

-- Analytics: Page views table
CREATE TABLE IF NOT EXISTS page_views (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255),
    visitor_id VARCHAR(255),
    page_url TEXT,
    page_title VARCHAR(500),
    referrer TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    screen_width INTEGER,
    screen_height INTEGER,
    country VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics: Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    visitor_id VARCHAR(255),
    entry_page TEXT,
    exit_page TEXT,
    page_views INTEGER DEFAULT 1,
    duration_seconds INTEGER,
    is_bounce BOOLEAN DEFAULT TRUE,
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP
);

-- Analytics: Events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255),
    visitor_id VARCHAR(255),
    event_name VARCHAR(255),
    event_data JSONB,
    page_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Project requests table
CREATE TABLE IF NOT EXISTS project_requests (
    id SERIAL PRIMARY KEY,
    output_type VARCHAR(100) NOT NULL,
    output_other TEXT,
    features TEXT,
    idea TEXT,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    budget VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_visitor_id ON sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_repositories_priority ON repositories(priority DESC);
CREATE INDEX IF NOT EXISTS idx_repositories_is_visible ON repositories(is_visible);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
"""

# Migrations to apply after table creation
MIGRATIONS_SQL = """
-- Add category column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'repositories' AND column_name = 'category'
    ) THEN
        ALTER TABLE repositories ADD COLUMN category VARCHAR(50) DEFAULT '기타';
        
        -- Update existing data based on project_type if available
        UPDATE repositories 
        SET category = CASE
          WHEN 'web' = ANY(SELECT jsonb_array_elements_text(project_type)) 
               OR 'website' = ANY(SELECT jsonb_array_elements_text(project_type))
               OR 'homepage' = ANY(SELECT jsonb_array_elements_text(project_type)) THEN '웹'
          WHEN 'mobile' = ANY(SELECT jsonb_array_elements_text(project_type))
               OR 'app' = ANY(SELECT jsonb_array_elements_text(project_type)) THEN '모바일'
          WHEN 'desktop' = ANY(SELECT jsonb_array_elements_text(project_type))
               OR 'program' = ANY(SELECT jsonb_array_elements_text(project_type))
               OR 'automation' = ANY(SELECT jsonb_array_elements_text(project_type)) THEN '데스크탑 프로그램'
          ELSE '기타'
        END
        WHERE category IS NULL OR category = '기타';
        
        RAISE NOTICE 'Added category column to repositories table';
    END IF;
END $$;
"""


async def create_tables(pool: asyncpg.Pool) -> None:
    """Create database tables if they don't exist."""
    async with pool.acquire() as conn:
        try:
            await conn.execute(SCHEMA_SQL)
            print("Database tables created/verified successfully!")
            
            # Run migrations
            await conn.execute(MIGRATIONS_SQL)
            print("Database migrations applied successfully!")
        except Exception as e:
            print(f"Error creating tables: {e}")
            raise


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
        
        # Create tables on startup
        await create_tables(_pool)
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
