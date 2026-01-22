from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class Technology(BaseModel):
    """Technology stack item."""
    name: str
    category: str
    version: Optional[str] = None


class Feature(BaseModel):
    """Project feature item."""
    title: str
    description: str


class Screenshot(BaseModel):
    """Screenshot metadata."""
    file: str
    caption: str
    type: Optional[str] = "desktop"
    url: Optional[str] = None


class Role(BaseModel):
    """Project role and contribution."""
    role_name: str
    responsibility: Optional[str] = None
    contribution_percentage: int = 100
    contributions: Optional[dict] = None


class PortfolioMeta(BaseModel):
    """Portfolio metadata from meta.json."""
    # Display
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    detailed_description: Optional[str] = None
    
    # Classification
    project_type: list[str] = []
    tags: list[str] = []
    status: str = "completed"
    priority: int = 0
    
    # Timeline
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_ongoing: bool = False
    
    # Details
    technologies: list[Technology] = []
    features: list[Feature] = []
    screenshots: list[Screenshot] = []
    
    # Links
    demo_url: Optional[str] = None
    documentation_url: Optional[str] = None
    
    # Metrics
    lines_of_code: Optional[int] = None
    commit_count: Optional[int] = None
    contributor_count: int = 1
    
    # Story
    challenges: Optional[str] = None
    achievements: Optional[str] = None
    
    # Roles
    roles: list[Role] = []
    
    # Client
    client_name: Optional[str] = None


class Repository(BaseModel):
    """Repository data model combining GitHub info and custom metadata."""
    # GitHub basic info
    id: int
    name: str
    full_name: str
    description: Optional[str] = None
    html_url: str
    language: Optional[str] = None
    stargazers_count: int = 0
    topics: list[str] = []
    github_created_at: Optional[datetime] = None
    github_updated_at: Optional[datetime] = None
    
    # Custom metadata
    title: Optional[str] = None
    subtitle: Optional[str] = None
    project_type: list[str] = []
    detailed_description: Optional[str] = None
    features: list[dict] = []
    technologies: list[dict] = []
    screenshots: list[dict] = []
    challenges: Optional[str] = None
    achievements: Optional[str] = None
    priority: int = 0
    roles: list[dict] = []
    client_name: Optional[str] = None
    status: str = "completed"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_ongoing: bool = False
    demo_url: Optional[str] = None
    documentation_url: Optional[str] = None
    
    # Metrics
    lines_of_code: Optional[int] = None
    commit_count: Optional[int] = None
    contributor_count: int = 1
    
    # Cache info
    has_portfolio_meta: bool = False
    cached_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class RepositoryListResponse(BaseModel):
    """Response model for repository list."""
    repositories: list[Repository]
    total: int
    last_updated: Optional[datetime] = None


class RefreshResponse(BaseModel):
    """Response model for refresh endpoint."""
    message: str
    updated_count: int
    errors: list[str] = []
