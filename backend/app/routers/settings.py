import logging
from typing import Optional, Dict, List

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.database import get_pool
from app.routers.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(tags=["settings"])


class SettingItem(BaseModel):
    key: str
    value: Optional[str] = None
    description: Optional[str] = None


class SettingsResponse(BaseModel):
    settings: Dict[str, str]


class UpdateSettingsRequest(BaseModel):
    settings: List[SettingItem]


class SNSLinksResponse(BaseModel):
    threads: Optional[str] = None
    youtube: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    email: Optional[str] = None


# Public endpoint - no auth required
@router.get("/settings/sns", response_model=SNSLinksResponse)
async def get_sns_links():
    """
    Get SNS links for public display.
    No authentication required.
    """
    pool = get_pool()
    
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT key, value FROM site_settings 
            WHERE key LIKE 'sns_%' OR key = 'contact_email'
            """
        )
        
        settings = {row['key']: row['value'] for row in rows}
        
        return SNSLinksResponse(
            threads=settings.get('sns_threads', ''),
            youtube=settings.get('sns_youtube', ''),
            github=settings.get('sns_github', ''),
            linkedin=settings.get('sns_linkedin', ''),
            email=settings.get('contact_email', '')
        )


# Admin endpoints - require auth
@router.get("/admin/settings", response_model=SettingsResponse)
async def get_all_settings(user: dict = Depends(get_current_user)):
    """
    Get all site settings (admin only).
    """
    pool = get_pool()
    
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT key, value FROM site_settings ORDER BY key")
        
        settings = {row['key']: row['value'] or '' for row in rows}
        
        return SettingsResponse(settings=settings)


@router.put("/admin/settings")
async def update_settings(
    request: UpdateSettingsRequest,
    user: dict = Depends(get_current_user)
):
    """
    Update site settings (admin only).
    """
    pool = get_pool()
    
    async with pool.acquire() as conn:
        updated = 0
        
        for item in request.settings:
            # Upsert each setting
            result = await conn.execute(
                """
                INSERT INTO site_settings (key, value, description, updated_at)
                VALUES ($1, $2, $3, NOW())
                ON CONFLICT (key) DO UPDATE SET
                    value = EXCLUDED.value,
                    description = COALESCE(EXCLUDED.description, site_settings.description),
                    updated_at = NOW()
                """,
                item.key,
                item.value,
                item.description
            )
            updated += 1
        
        return {"success": True, "updated": updated}


@router.get("/admin/settings/{key}")
async def get_setting(key: str, user: dict = Depends(get_current_user)):
    """
    Get a specific setting by key (admin only).
    """
    pool = get_pool()
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT key, value, description FROM site_settings WHERE key = $1",
            key
        )
        
        if not row:
            raise HTTPException(status_code=404, detail="Setting not found")
        
        return {
            "key": row['key'],
            "value": row['value'],
            "description": row['description']
        }


@router.delete("/admin/settings/{key}")
async def delete_setting(key: str, user: dict = Depends(get_current_user)):
    """
    Delete a setting by key (admin only).
    """
    pool = get_pool()
    
    async with pool.acquire() as conn:
        result = await conn.execute(
            "DELETE FROM site_settings WHERE key = $1",
            key
        )
        
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Setting not found")
        
        return {"success": True, "deleted": key}
