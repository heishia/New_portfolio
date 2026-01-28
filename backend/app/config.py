from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App
    app_env: str = "dev"
    
    # Database
    database_url: str = "postgresql://localhost:5432/portfolio"
    
    # GitHub
    github_token: str = ""
    github_username: str = ""
    
    # CORS
    cors_origins: str = "http://localhost:5173"
    
    # API Security
    api_secret: str = ""
    
    # Cloudflare R2
    r2_endpoint: str = ""
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_bucket_name: str = ""
    r2_public_url: str = ""
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
