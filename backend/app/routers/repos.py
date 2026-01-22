import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Header, BackgroundTasks

from app.config import get_settings
from app.schemas.repo import Repository, RepositoryListResponse, RefreshResponse
from app.services.github import github_service
from app.services.repository import repository_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["repositories"])


@router.get("/repos", response_model=RepositoryListResponse)
async def get_repositories():
    """
    Get cached repository list.
    
    Returns repositories sorted by priority (highest first),
    then by last updated date.
    """
    try:
        repos = await repository_service.get_all()
        last_updated = await repository_service.get_last_updated()
        
        return RepositoryListResponse(
            repositories=repos,
            total=len(repos),
            last_updated=last_updated,
        )
    except Exception as e:
        logger.error(f"Failed to get repositories: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch repositories")


@router.get("/repos/{repo_id}", response_model=Repository)
async def get_repository(repo_id: int):
    """Get a single repository by ID."""
    repo = await repository_service.get_by_id(repo_id)
    
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    return repo


@router.post("/repos/refresh", response_model=RefreshResponse)
async def refresh_repositories(
    background_tasks: BackgroundTasks,
    authorization: Optional[str] = Header(None),
):
    """
    Trigger repository data refresh from GitHub.
    
    This endpoint fetches all repositories from GitHub,
    retrieves portfolio metadata if available, and updates the cache.
    
    Optional: Pass API_SECRET in Authorization header for security.
    """
    settings = get_settings()
    
    # Verify API secret if configured
    if settings.api_secret:
        if not authorization:
            raise HTTPException(status_code=401, detail="Authorization required")
        
        # Support both "Bearer <token>" and direct token
        token = authorization.replace("Bearer ", "").strip()
        if token != settings.api_secret:
            raise HTTPException(status_code=403, detail="Invalid authorization")
    
    try:
        # Fetch from GitHub and update cache
        repos = await github_service.fetch_all_repos_with_meta()
        updated_count = await repository_service.upsert_many(repos)
        
        return RefreshResponse(
            message="Refresh completed successfully",
            updated_count=updated_count,
        )
    except Exception as e:
        logger.error(f"Failed to refresh repositories: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to refresh repositories: {str(e)}"
        )


@router.post("/repos/refresh/async")
async def refresh_repositories_async(
    background_tasks: BackgroundTasks,
    authorization: Optional[str] = Header(None),
):
    """
    Trigger repository refresh in background.
    
    Returns immediately and processes in background.
    Useful for GitHub Actions cron jobs.
    """
    settings = get_settings()
    
    # Verify API secret if configured
    if settings.api_secret:
        if not authorization:
            raise HTTPException(status_code=401, detail="Authorization required")
        
        token = authorization.replace("Bearer ", "").strip()
        if token != settings.api_secret:
            raise HTTPException(status_code=403, detail="Invalid authorization")
    
    async def refresh_task():
        try:
            repos = await github_service.fetch_all_repos_with_meta()
            await repository_service.upsert_many(repos)
            logger.info(f"Background refresh completed: {len(repos)} repos updated")
        except Exception as e:
            logger.error(f"Background refresh failed: {e}")
    
    background_tasks.add_task(refresh_task)
    
    return {"message": "Refresh started in background"}
