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
    
    # Railway Bucket (S3 compatible)
    bucket_endpoint: str = "https://storage.railway.app"
    bucket_access_key_id: str = ""
    bucket_secret_access_key: str = ""
    bucket_name: str = ""
    
    # Email (SMTP)
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    notification_email: str = "bluejin1130@gmail.com"
    
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
