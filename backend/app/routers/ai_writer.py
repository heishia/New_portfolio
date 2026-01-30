"""AI Writer API endpoints."""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.routers.auth import get_current_user
from app.services.ai_writer import ai_writer_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["ai-writer"])


class GenerateContentRequest(BaseModel):
    """Request body for content generation."""
    content_type: str  # resume, cover_letter, freelance_proposal, self_introduction, linkedin_summary, portfolio_overview, custom
    custom_prompt: Optional[str] = None
    tone: str = "professional"  # professional, casual, creative
    language: str = "ko"  # ko, en


class GenerateContentResponse(BaseModel):
    """Response body for content generation."""
    content: str
    content_type: str


class ContentTypeInfo(BaseModel):
    """Information about a content type."""
    id: str
    label: str
    description: str


@router.get("/content-types")
async def get_content_types(user: dict = Depends(get_current_user)) -> list[ContentTypeInfo]:
    """Get available content types for generation."""
    return [
        ContentTypeInfo(
            id="resume",
            label="이력서",
            description="프로젝트 경력 섹션용 이력서 내용",
        ),
        ContentTypeInfo(
            id="cover_letter",
            label="자기소개서",
            description="지원서용 자기소개서/커버레터",
        ),
        ContentTypeInfo(
            id="freelance_proposal",
            label="외주 제안서",
            description="프리랜서/외주 작업용 자기소개",
        ),
        ContentTypeInfo(
            id="self_introduction",
            label="간단 자기소개",
            description="1-2분 분량의 짧은 자기소개",
        ),
        ContentTypeInfo(
            id="linkedin_summary",
            label="LinkedIn 요약",
            description="LinkedIn 프로필용 요약글",
        ),
        ContentTypeInfo(
            id="portfolio_overview",
            label="포트폴리오 소개",
            description="포트폴리오 페이지용 소개글",
        ),
        ContentTypeInfo(
            id="custom",
            label="커스텀",
            description="직접 프롬프트 입력",
        ),
    ]


@router.post("/generate", response_model=GenerateContentResponse)
async def generate_content(
    request: GenerateContentRequest,
    user: dict = Depends(get_current_user),
):
    """
    Generate content based on portfolio data using AI.
    
    Requires admin authentication.
    """
    try:
        content = await ai_writer_service.generate_content(
            content_type=request.content_type,
            custom_prompt=request.custom_prompt,
            tone=request.tone,
            language=request.language,
        )
        
        return GenerateContentResponse(
            content=content,
            content_type=request.content_type,
        )
        
    except RuntimeError as e:
        logger.error(f"Content generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during content generation: {e}")
        raise HTTPException(status_code=500, detail="콘텐츠 생성 중 오류가 발생했습니다.")


@router.get("/portfolio-summary")
async def get_portfolio_summary(user: dict = Depends(get_current_user)):
    """
    Get the portfolio summary that will be used for AI generation.
    
    Useful for debugging and understanding what data the AI sees.
    """
    try:
        summary = await ai_writer_service.get_portfolio_summary()
        return {"summary": summary}
    except Exception as e:
        logger.error(f"Failed to get portfolio summary: {e}")
        raise HTTPException(status_code=500, detail="포트폴리오 요약 조회 실패")
