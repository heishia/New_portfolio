import uuid
import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import RedirectResponse, FileResponse
from typing import List

from app.config import get_settings
from app.routers.auth import get_current_user

router = APIRouter(prefix="/upload", tags=["upload"])

# 로컬 저장 경로 (개발용)
LOCAL_UPLOAD_DIR = Path(__file__).parent.parent.parent.parent / "public" / "uploads"


def is_bucket_configured() -> bool:
    """Bucket 설정이 되어있는지 확인"""
    settings = get_settings()
    return bool(
        settings.bucket_access_key_id and 
        settings.bucket_secret_access_key and 
        settings.bucket_name
    )


def get_s3_client():
    """Railway Bucket S3 클라이언트 생성"""
    import boto3
    from botocore.config import Config
    
    settings = get_settings()
    
    # Railway Object Store는 https://storage.railway.app을 endpoint로 사용하고
    # path-style addressing이 필요함
    endpoint = settings.bucket_endpoint
    if settings.bucket_name in endpoint:
        # 버킷명이 포함된 endpoint면 기본 endpoint로 변경
        endpoint = "https://storage.railway.app"
    
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=settings.bucket_access_key_id,
        aws_secret_access_key=settings.bucket_secret_access_key,
        config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
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
    """프로젝트 스크린샷 업로드 (Railway Bucket 또는 로컬)"""
    settings = get_settings()
    use_bucket = is_bucket_configured()
    
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
            
            if use_bucket:
                # Railway Bucket에 업로드
                client = get_s3_client()
                client.put_object(
                    Bucket=settings.bucket_name,
                    Key=key,
                    Body=content,
                    ContentType=content_type
                )
                
                # Public URL 사용 (presigner 서비스 경유)
                if settings.bucket_public_url:
                    public_url = f"{settings.bucket_public_url}/{key}"
                else:
                    # fallback: presigned URL
                    public_url = generate_presigned_url(key, expires_in=86400 * 90)
                
                uploaded_files.append({
                    "key": key,
                    "url": public_url
                })
            else:
                # 로컬 저장 (개발용)
                local_path = LOCAL_UPLOAD_DIR / key
                local_path.parent.mkdir(parents=True, exist_ok=True)
                
                with open(local_path, "wb") as f:
                    f.write(content)
                
                print(f"[Upload] Saved locally: {local_path}")
                
                uploaded_files.append({
                    "key": key,
                    "url": f"/uploads/{key}"  # 프론트엔드에서 접근 가능한 경로
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
    """파일 조회 - Bucket이면 Presigned URL, 로컬이면 FileResponse"""
    use_bucket = is_bucket_configured()
    
    if use_bucket:
        try:
            presigned_url = generate_presigned_url(key, expires_in=3600)  # 1시간
            return RedirectResponse(url=presigned_url, status_code=302)
        except Exception as e:
            print(f"[Upload] Error generating URL for {key}: {e}")
            raise HTTPException(status_code=404, detail="File not found")
    else:
        # 로컬 파일 반환
        local_path = LOCAL_UPLOAD_DIR / key
        if not local_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        return FileResponse(local_path)


@router.delete("/screenshots")
async def delete_screenshot(
    key: str,
    user: dict = Depends(get_current_user)
):
    """스크린샷 삭제"""
    use_bucket = is_bucket_configured()
    
    if use_bucket:
        try:
            client = get_s3_client()
            settings = get_settings()
            client.delete_object(
                Bucket=settings.bucket_name,
                Key=key
            )
            return {"success": True}
        except Exception as e:
            print(f"[Upload] Error deleting {key}: {e}")
            raise HTTPException(status_code=500, detail="Failed to delete file")
    else:
        # 로컬 파일 삭제
        local_path = LOCAL_UPLOAD_DIR / key
        try:
            if local_path.exists():
                local_path.unlink()
            return {"success": True}
        except Exception as e:
            print(f"[Upload] Error deleting local file {key}: {e}")
            raise HTTPException(status_code=500, detail="Failed to delete file")
