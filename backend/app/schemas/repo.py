from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class Technology(BaseModel):
    """Technology stack item."""
    name: str
    category: str
    version: Optional[str] = None


class Feature(BaseModel):
    """Project feature item with detailed description."""
    title: str
    description: str
    sub_description: Optional[str] = None  # Additional details


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


class SystemComponent(BaseModel):
    """System architecture component."""
    name: str  # e.g., "Backend (FastAPI)"
    description: str  # e.g., "RESTful API, OAuth 처리, 비즈니스 로직"


class CorePrinciple(BaseModel):
    """Core design principle."""
    title: str  # e.g., "SSO (Single Sign-On)"
    description: str  # e.g., "PPOP Auth를 통한 통합 인증"


class TechnicalChallenge(BaseModel):
    """Technical challenge with solution."""
    title: str  # e.g., "PPOP Auth SSO 연동"
    challenge: str  # 도전: 외부 인증 서버와의 OAuth 2.0 플로우 구현...
    solution: str  # 해결: PyJWKClient를 싱글톤 패턴으로 구현하여...


class CodeSnippet(BaseModel):
    """Code snippet for showcase."""
    title: str  # e.g., "PPOP Auth JWT 토큰 검증 (JWKS)"
    description: str  # e.g., "JWKS를 사용한 RS256 JWT 토큰 검증 로직"
    file_path: str  # e.g., "backend/core/security.py"
    language: str  # e.g., "python"
    code: str  # Actual code


class DataModel(BaseModel):
    """Data model description."""
    name: str  # e.g., "users"
    description: str  # e.g., "사용자 프로필 (id는 PPOP Auth user_id UUID)"


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
    
    # Story (legacy - kept for backward compatibility)
    challenges: Optional[str] = None
    achievements: Optional[str] = None
    
    # Roles
    roles: list[Role] = []
    
    # Client
    client_name: Optional[str] = None
    
    # === NEW: Architecture & Technical Details ===
    # Architecture overview
    architecture: Optional[str] = None  # 아키텍처 개요 텍스트
    
    # System components
    system_components: list[SystemComponent] = []  # 시스템 구성 요소
    
    # Core principles
    core_principles: list[CorePrinciple] = []  # 핵심 원칙
    
    # Auth flow (if applicable)
    auth_flow: list[str] = []  # 인증 플로우 단계 리스트
    
    # Data models
    data_models: list[DataModel] = []  # 데이터 모델
    
    # Technical challenges (detailed)
    technical_challenges: list[TechnicalChallenge] = []  # 기술적 도전과제
    
    # Key achievements (detailed list)
    key_achievements: list[str] = []  # 주요 성과 리스트
    
    # Code snippets
    code_snippets: list[CodeSnippet] = []  # 코드 스니펫


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
    
    # === NEW: Architecture & Technical Details ===
    architecture: Optional[str] = None
    system_components: list[dict] = []
    core_principles: list[dict] = []
    auth_flow: list[str] = []
    data_models: list[dict] = []
    technical_challenges: list[dict] = []
    key_achievements: list[str] = []
    code_snippets: list[dict] = []
    
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
