from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional

from app.schemas.auth import (
    LoginRequest, LoginResponse, 
    RegisterRequest, UserResponse, MeResponse
)
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """현재 로그인한 사용자 가져오기"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization[7:]  # "Bearer " 제거
    session = await auth_service.get_session(token)
    
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return session["user"]


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """관리자 로그인"""
    user = await auth_service.authenticate_user(request.email, request.password)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = await auth_service.create_session(user["id"])
    
    return LoginResponse(
        token=token,
        user=UserResponse(**user)
    )


@router.post("/logout")
async def logout(authorization: Optional[str] = Header(None)):
    """로그아웃"""
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
        await auth_service.delete_session(token)
    
    return {"message": "Logged out"}


@router.get("/me", response_model=MeResponse)
async def get_me(user: dict = Depends(get_current_user)):
    """현재 사용자 정보 조회"""
    return MeResponse(user=UserResponse(**user))


@router.post("/register", response_model=UserResponse)
async def register(request: RegisterRequest, user: dict = Depends(get_current_user)):
    """새 관리자 등록 (기존 관리자만 가능)"""
    # 이미 존재하는 이메일인지 확인
    existing = await auth_service.get_user_by_email(request.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = await auth_service.create_user(
        email=request.email,
        password=request.password,
        name=request.name
    )
    
    return UserResponse(**new_user)
