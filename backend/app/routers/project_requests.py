"""Project requests router - handles form submissions."""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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


class ProjectRequestResponse(BaseModel):
    """Schema for project request response."""
    id: int
    output_type: str
    output_other: Optional[str]
    features: Optional[str]
    idea: Optional[str]
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


def send_email_notification(request_data: ProjectRequestCreate, request_id: int) -> bool:
    """Send email notification for new project request."""
    settings = get_settings()
    
    # Skip if email settings not configured
    if not settings.smtp_host or not settings.smtp_user:
        print("Email settings not configured, skipping notification")
        return False
    
    try:
        # Build email content
        output_label = OUTPUT_TYPE_LABELS.get(request_data.output_type, request_data.output_type)
        if request_data.output_type == "other" and request_data.output_other:
            output_label = f"기타: {request_data.output_other}"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">🚀 새로운 프로젝트 요청</h2>
            <p style="color: #666;">새로운 프로젝트 요청이 접수되었습니다.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tr style="background: #f5f5f5;">
                    <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; width: 30%;">요청 번호</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">#{request_id}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">원하는 아웃풋</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">{output_label}</td>
                </tr>
                <tr style="background: #f5f5f5;">
                    <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">원하는 기능</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">{request_data.features or '-'}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">아이디어 설명</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">{request_data.idea or '-'}</td>
                </tr>
            </table>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
                이 이메일은 포트폴리오 사이트에서 자동으로 발송되었습니다.
            </p>
        </body>
        </html>
        """
        
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"[포트폴리오] 새 프로젝트 요청 #{request_id}"
        msg["From"] = settings.smtp_user
        msg["To"] = settings.notification_email
        
        msg.attach(MIMEText(html_content, "html"))
        
        # Send email
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
        
        print(f"Email notification sent for request #{request_id}")
        return True
        
    except Exception as e:
        print(f"Failed to send email notification: {e}")
        return False


@router.post("", response_model=ProjectRequestResponse)
async def create_project_request(request: ProjectRequestCreate):
    """Create a new project request and send email notification."""
    pool = get_pool()
    
    async with pool.acquire() as conn:
        # Insert into database
        row = await conn.fetchrow(
            """
            INSERT INTO project_requests (output_type, output_other, features, idea)
            VALUES ($1, $2, $3, $4)
            RETURNING id, output_type, output_other, features, idea, status, created_at
            """,
            request.output_type,
            request.output_other,
            request.features,
            request.idea,
        )
        
        if not row:
            raise HTTPException(status_code=500, detail="Failed to create project request")
        
        # Send email notification (non-blocking, don't fail if email fails)
        send_email_notification(request, row["id"])
        
        return ProjectRequestResponse(**dict(row))


@router.get("")
async def list_project_requests():
    """List all project requests (admin only in future)."""
    pool = get_pool()
    
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, output_type, output_other, features, idea, status, created_at
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
