"""AI Writer Service using Google Vertex AI (Gemini)."""
import json
import logging
import os
import tempfile
from typing import Optional

import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig

from app.config import get_settings
from app.services.repository import repository_service

logger = logging.getLogger(__name__)


class AIWriterService:
    """Service for generating portfolio-based content using Vertex AI."""
    
    def __init__(self):
        self._initialized = False
        self._model: Optional[GenerativeModel] = None
        self._temp_credentials_file: Optional[str] = None
    
    def _ensure_initialized(self):
        """Initialize Vertex AI if not already done."""
        if self._initialized:
            return
        
        settings = get_settings()
        
        # Handle credentials - can be either a file path or JSON string
        if settings.google_application_credentials:
            creds = settings.google_application_credentials.strip()
            
            # Check if it's a JSON string (starts with {)
            if creds.startswith('{'):
                try:
                    # Parse to validate JSON
                    creds_dict = json.loads(creds)
                    
                    # Write to temp file
                    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
                        json.dump(creds_dict, f)
                        self._temp_credentials_file = f.name
                    
                    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = self._temp_credentials_file
                    logger.info("Using credentials from JSON string")
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse credentials JSON: {e}")
                    raise RuntimeError("Invalid credentials JSON format")
            else:
                # It's a file path
                os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = creds
                logger.info(f"Using credentials from file: {creds}")
        
        # Initialize Vertex AI
        vertexai.init(
            project=settings.gcp_project_id,
            location=settings.gcp_location,
        )
        
        # Use Gemini 3 Flash for better reasoning and quality
        self._model = GenerativeModel("gemini-3-flash-preview")
        self._initialized = True
        logger.info(f"Vertex AI initialized: project={settings.gcp_project_id}, location={settings.gcp_location}")
    
    async def get_portfolio_summary(self) -> str:
        """Get a summary of all portfolio projects for AI context."""
        repos = await repository_service.get_all(include_hidden=False)
        
        if not repos:
            return "포트폴리오 프로젝트가 없습니다."
        
        summary_parts = []
        
        for repo in repos:
            project_info = f"""
## {repo.title or repo.name}
- 설명: {repo.description or repo.detailed_description or '없음'}
- 기술 스택: {', '.join([t.get('name', t) if isinstance(t, dict) else str(t) for t in (repo.technologies or [])])}
- 프로젝트 유형: {', '.join(repo.project_type or [])}
- 역할: {', '.join([r.get('title', r) if isinstance(r, dict) else str(r) for r in (repo.roles or [])])}
- 주요 기능: {', '.join([f.get('title', f) if isinstance(f, dict) else str(f) for f in (repo.features or [])][:5])}
- GitHub: {repo.html_url}
- 데모: {repo.demo_url or '없음'}
- 상태: {repo.status}
- 커밋 수: {repo.commit_count or '알 수 없음'}
- 코드 라인: {repo.lines_of_code or '알 수 없음'}
"""
            if repo.challenges:
                project_info += f"- 도전 과제: {repo.challenges}\n"
            if repo.achievements:
                project_info += f"- 성과: {repo.achievements}\n"
            if repo.architecture:
                project_info += f"- 아키텍처: {repo.architecture}\n"
            
            summary_parts.append(project_info)
        
        return "\n---\n".join(summary_parts)
    
    async def generate_content(
        self,
        content_type: str,
        custom_prompt: Optional[str] = None,
        tone: str = "professional",
        language: str = "ko",
    ) -> str:
        """
        Generate content based on portfolio data.
        
        Args:
            content_type: Type of content (resume, cover_letter, freelance_proposal, self_introduction, etc.)
            custom_prompt: Additional instructions or context
            tone: Writing tone (professional, casual, creative)
            language: Output language (ko, en)
        
        Returns:
            Generated content string
        """
        self._ensure_initialized()
        
        # Get portfolio data
        portfolio_summary = await self.get_portfolio_summary()
        
        # Build system prompt based on content type
        content_prompts = {
            "resume": """이력서용 프로젝트 경력 섹션을 작성해주세요.
- 각 프로젝트별로 역할, 기술 스택, 주요 성과를 정리
- 정량적 성과가 있다면 강조
- 기술적 도전과 해결 과정 포함
- 채용 담당자가 읽기 좋게 구성""",
            
            "cover_letter": """자기소개서/커버레터를 작성해주세요.
- 프로젝트 경험을 기반으로 역량 어필
- 기술적 성장 스토리 포함
- 팀 협업 경험과 문제 해결 능력 강조
- 열정과 성장 가능성 표현""",
            
            "freelance_proposal": """외주/프리랜서 제안서용 자기소개를 작성해주세요.
- 완료한 프로젝트들을 실적으로 제시
- 기술 스택과 전문 분야 명확히
- 신뢰성과 책임감 어필
- 클라이언트 관점에서 어떤 가치를 제공하는지 설명""",
            
            "self_introduction": """간단한 자기소개를 작성해주세요.
- 1-2분 내로 읽을 수 있는 분량
- 핵심 기술 스택과 주요 프로젝트 언급
- 개발자로서의 철학이나 강점
- 친근하면서도 전문적인 톤""",
            
            "linkedin_summary": """LinkedIn 프로필 요약을 작성해주세요.
- 전문성과 경력 하이라이트
- 관심 분야와 핵심 기술
- 네트워킹에 열린 자세
- 영어와 한국어 병기 가능""",
            
            "portfolio_overview": """포트폴리오 소개 페이지용 텍스트를 작성해주세요.
- 전체 프로젝트를 아우르는 개요
- 개발 철학과 접근 방식
- 기술적 깊이와 다양성 표현
- 방문자가 프로젝트를 탐색하고 싶게 만드는 훅""",
            
            "custom": custom_prompt or "포트폴리오를 기반으로 자유롭게 글을 작성해주세요.",
        }
        
        tone_instructions = {
            "professional": "전문적이고 격식있는 톤으로 작성",
            "casual": "친근하고 편안한 톤으로 작성",
            "creative": "창의적이고 개성있는 톤으로 작성",
        }
        
        language_instructions = {
            "ko": "한국어로 작성해주세요.",
            "en": "Write in English.",
        }
        
        content_instruction = content_prompts.get(content_type, content_prompts["custom"])
        tone_instruction = tone_instructions.get(tone, tone_instructions["professional"])
        lang_instruction = language_instructions.get(language, language_instructions["ko"])
        
        # Build the full prompt
        full_prompt = f"""당신은 개발자 포트폴리오를 기반으로 글을 작성하는 전문 작가입니다.

## 작성 요청
{content_instruction}

## 톤 & 스타일
{tone_instruction}

## 언어
{lang_instruction}

{f"## 추가 지시사항{chr(10)}{custom_prompt}" if custom_prompt and content_type != "custom" else ""}

---

## 포트폴리오 데이터

{portfolio_summary}

---

위 포트폴리오 데이터를 분석하여 요청된 형식의 글을 작성해주세요.
마크다운 형식으로 작성하되, 실제 사용 시 쉽게 복사할 수 있도록 깔끔하게 정리해주세요.
"""
        
        try:
            # Generate content
            generation_config = GenerationConfig(
                temperature=0.7,
                top_p=0.9,
                max_output_tokens=4096,
            )
            
            response = self._model.generate_content(
                full_prompt,
                generation_config=generation_config,
            )
            
            return response.text
            
        except Exception as e:
            logger.error(f"Failed to generate content: {e}")
            raise RuntimeError(f"AI 콘텐츠 생성 실패: {str(e)}")


# Singleton instance
ai_writer_service = AIWriterService()
