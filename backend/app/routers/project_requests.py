"""Project requests router - handles form submissions."""
import httpx
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.database import get_pool
from app.config import get_settings


router = APIRouter(prefix="/project-requests", tags=["project-requests"])


class ProjectRequestCreate(BaseModel):
    """Schema for creating a project request."""
    output_type: str
    output_other: Optional[str] = None
    features: Optional[str] = None
    idea: Optional[str] = None
    # Contact information
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    budget: Optional[str] = None


class ProjectRequestResponse(BaseModel):
    """Schema for project request response."""
    id: int
    output_type: str
    output_other: Optional[str]
    features: Optional[str]
    idea: Optional[str]
    contact_name: Optional[str]
    contact_email: Optional[str]
    contact_phone: Optional[str]
    budget: Optional[str]
    status: str
    created_at: datetime


OUTPUT_TYPE_LABELS = {
    "website": "웹사이트",
    "webapp": "웹 애플리케이션",
    "mobile": "모바일 앱",
    "automation": "자동화 프로그램",
    "dashboard": "대시보드/관리자 페이지",
    "other": "기타",
}


def send_discord_notification(request_data: ProjectRequestCreate, request_id: int) -> bool:
    """Send Discord webhook notification for new project request."""
    settings = get_settings()
    
    # Skip if webhook not configured
    if not settings.discord_webhook_url:
        print("Discord webhook not configured, skipping notification")
        return False
    
    try:
        # Build output label
        output_label = OUTPUT_TYPE_LABELS.get(request_data.output_type, request_data.output_type)
        if request_data.output_type == "other" and request_data.output_other:
            output_label = f"기타: {request_data.output_other}"
        
        # Discord embed message
        embed = {
            "title": f"🚀 새로운 프로젝트 요청 #{request_id}",
            "color": 5814783,  # Blue color
            "fields": [
                {"name": "📋 원하는 아웃풋", "value": output_label, "inline": True},
                {"name": "💰 예산", "value": request_data.budget or "-", "inline": True},
                {"name": "👤 담당자", "value": request_data.contact_name or "-", "inline": True},
                {"name": "📧 이메일", "value": request_data.contact_email or "-", "inline": True},
                {"name": "📱 전화번호", "value": request_data.contact_phone or "-", "inline": True},
                {"name": "⚙️ 원하는 기능", "value": request_data.features or "-", "inline": False},
                {"name": "💡 아이디어 설명", "value": (request_data.idea[:500] + "...") if request_data.idea and len(request_data.idea) > 500 else (request_data.idea or "-"), "inline": False},
            ],
            "footer": {"text": "포트폴리오 사이트"},
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        payload = {"embeds": [embed]}
        
        # Send to Discord
        with httpx.Client() as client:
            response = client.post(settings.discord_webhook_url, json=payload)
            response.raise_for_status()
        
        print(f"Discord notification sent for request #{request_id}")
        return True
        
    except Exception as e:
        print(f"Failed to send Discord notification: {e}")
        return False


@router.post("", response_model=ProjectRequestResponse)
async def create_project_request(request: ProjectRequestCreate):
    """Create a new project request and send email notification."""
    pool = get_pool()
    
    async with pool.acquire() as conn:
        # Insert into database
        row = await conn.fetchrow(
            """
            INSERT INTO project_requests (output_type, output_other, features, idea, contact_name, contact_email, contact_phone, budget)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, output_type, output_other, features, idea, contact_name, contact_email, contact_phone, budget, status, created_at
            """,
            request.output_type,
            request.output_other,
            request.features,
            request.idea,
            request.contact_name,
            request.contact_email,
            request.contact_phone,
            request.budget,
        )
        
        if not row:
            raise HTTPException(status_code=500, detail="Failed to create project request")
        
        # Send Discord notification (non-blocking, don't fail if notification fails)
        send_discord_notification(request, row["id"])
        
        return ProjectRequestResponse(**dict(row))


@router.get("")
async def list_project_requests():
    """List all project requests (admin only in future)."""
    pool = get_pool()
    
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, output_type, output_other, features, idea, contact_name, contact_email, contact_phone, budget, status, created_at
            FROM project_requests
            ORDER BY created_at DESC
            """
        )
        
        return [dict(row) for row in rows]


@router.patch("/{request_id}/status")
async def update_request_status(request_id: int, status: str):
    """Update project request status."""
    valid_statuses = ["pending", "reviewed", "in_progress", "completed", "rejected"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    pool = get_pool()
    
    async with pool.acquire() as conn:
        result = await conn.execute(
            """
            UPDATE project_requests
            SET status = $1, updated_at = NOW()
            WHERE id = $2
            """,
            status,
            request_id,
        )
        
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="Project request not found")
        
        return {"message": "Status updated", "status": status}
