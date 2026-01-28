import uuid
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List
import boto3
from botocore.config import Config

from app.config import get_settings
from app.routers.auth import get_current_user

router = APIRouter(prefix="/upload", tags=["upload"])


def get_r2_client():
    """Cloudflare R2 클라이언트 생성"""
    settings = get_settings()
    
    return boto3.client(
        "s3",
        endpoint_url=settings.r2_endpoint,
        aws_access_key_id=settings.r2_access_key_id,
        aws_secret_access_key=settings.r2_secret_access_key,
        config=Config(signature_version="s3v4"),
        region_name="auto"
    )


@router.post("/screenshots")
async def upload_screenshots(
    files: List[UploadFile] = File(...),
    project_id: int = Form(...),
    user: dict = Depends(get_current_user)
):
    """프로젝트 스크린샷 업로드"""
    settings = get_settings()
    
    if not settings.r2_endpoint:
        raise HTTPException(
            status_code=500, 
            detail="R2 storage not configured"
        )
    
    client = get_r2_client()
    uploaded_urls = []
    
    for file in files:
        # 파일 확장자 확인
        content_type = file.content_type or "image/jpeg"
        if not content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: {content_type}"
            )
        
        # 파일명 생성 (UUID + 원본 확장자)
        ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
        filename = f"screenshots/{project_id}/{uuid.uuid4()}.{ext}"
        
        try:
            # 파일 읽기
            content = await file.read()
            
            # R2에 업로드
            client.put_object(
                Bucket=settings.r2_bucket_name,
                Key=filename,
                Body=content,
                ContentType=content_type
            )
            
            # 공개 URL 생성
            public_url = f"{settings.r2_public_url}/{filename}"
            uploaded_urls.append(public_url)
            
        except Exception as e:
            print(f"[Upload] Error uploading {file.filename}: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload {file.filename}"
            )
    
    return {"urls": uploaded_urls}


@router.delete("/screenshots")
async def delete_screenshot(
    url: str,
    user: dict = Depends(get_current_user)
):
    """스크린샷 삭제"""
    settings = get_settings()
    
    if not settings.r2_endpoint:
        raise HTTPException(
            status_code=500, 
            detail="R2 storage not configured"
        )
    
    # URL에서 키 추출
    if not url.startswith(settings.r2_public_url):
        raise HTTPException(status_code=400, detail="Invalid URL")
    
    key = url.replace(f"{settings.r2_public_url}/", "")
    
    try:
        client = get_r2_client()
        client.delete_object(
            Bucket=settings.r2_bucket_name,
            Key=key
        )
        return {"success": True}
    except Exception as e:
        print(f"[Upload] Error deleting {key}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete file")
