import uuid
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import RedirectResponse
from typing import List
import boto3
from botocore.config import Config

from app.config import get_settings
from app.routers.auth import get_current_user

router = APIRouter(prefix="/upload", tags=["upload"])


def get_s3_client():
    """Railway Bucket S3 클라이언트 생성"""
    settings = get_settings()
    
    return boto3.client(
        "s3",
        endpoint_url=settings.bucket_endpoint,
        aws_access_key_id=settings.bucket_access_key_id,
        aws_secret_access_key=settings.bucket_secret_access_key,
        config=Config(signature_version="s3v4"),
        region_name="auto"
    )


def generate_presigned_url(key: str, expires_in: int = 86400 * 7) -> str:
    """Presigned URL 생성 (기본 7일 유효)"""
    settings = get_settings()
    client = get_s3_client()
    
    url = client.generate_presigned_url(
        'get_object',
        Params={
            'Bucket': settings.bucket_name,
            'Key': key
        },
        ExpiresIn=expires_in
    )
    return url


@router.post("/screenshots")
async def upload_screenshots(
    files: List[UploadFile] = File(...),
    project_id: int = Form(...),
    user: dict = Depends(get_current_user)
):
    """프로젝트 스크린샷 업로드 (Railway Bucket)"""
    settings = get_settings()
    
    if not settings.bucket_endpoint:
        raise HTTPException(
            status_code=500, 
            detail="Storage bucket not configured"
        )
    
    client = get_s3_client()
    uploaded_files = []
    
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
        key = f"screenshots/{project_id}/{uuid.uuid4()}.{ext}"
        
        try:
            # 파일 읽기
            content = await file.read()
            
            # Railway Bucket에 업로드
            client.put_object(
                Bucket=settings.bucket_name,
                Key=key,
                Body=content,
                ContentType=content_type
            )
            
            # Presigned URL 생성 (90일 - Railway 최대)
            presigned_url = generate_presigned_url(key, expires_in=86400 * 90)
            
            uploaded_files.append({
                "key": key,
                "url": presigned_url
            })
            
        except Exception as e:
            print(f"[Upload] Error uploading {file.filename}: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload {file.filename}"
            )
    
    return {
        "urls": [f["url"] for f in uploaded_files],
        "keys": [f["key"] for f in uploaded_files]
    }


@router.get("/file/{key:path}")
async def get_file(key: str):
    """파일 조회 - Presigned URL로 리다이렉트"""
    settings = get_settings()
    
    if not settings.bucket_endpoint:
        raise HTTPException(status_code=500, detail="Storage not configured")
    
    try:
        presigned_url = generate_presigned_url(key, expires_in=3600)  # 1시간
        return RedirectResponse(url=presigned_url, status_code=302)
    except Exception as e:
        print(f"[Upload] Error generating URL for {key}: {e}")
        raise HTTPException(status_code=404, detail="File not found")


@router.delete("/screenshots")
async def delete_screenshot(
    key: str,
    user: dict = Depends(get_current_user)
):
    """스크린샷 삭제"""
    settings = get_settings()
    
    if not settings.bucket_endpoint:
        raise HTTPException(
            status_code=500, 
            detail="Storage bucket not configured"
        )
    
    try:
        client = get_s3_client()
        client.delete_object(
            Bucket=settings.bucket_name,
            Key=key
        )
        return {"success": True}
    except Exception as e:
        print(f"[Upload] Error deleting {key}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete file")
