# Portfolio Meta.json AI 가이드

이 문서는 AI에게 프로젝트 정보 저장을 요청할 때 참조용으로 제공하세요.

---

## 저장 위치

각 GitHub 레포지토리의 `portfolio/meta.json` 경로에 저장

```
my-project/
├── portfolio/
│   ├── meta.json          ← 여기에 저장
│   └── screenshots/       ← 스크린샷 이미지
│       ├── main.png
│       └── feature.png
├── src/
└── ...
```

---

## 필수 필드

| 필드 | 설명 |
|------|------|
| `title` | 프로젝트 제목 |
| `project_type` | 프로젝트 유형 배열 (예: `["Web", "API"]`) |
| `technologies` | 기술 스택 배열 |

---

## 전체 예시

```json
{
  "title": "AI 오케스트레이션 프레임워크",
  "subtitle": "Claude Code + Cursor 연동",
  "detailed_description": "여러 AI 에이전트를 조율하여 복잡한 개발 작업을 자동화하는 프레임워크입니다. Claude Code와 Cursor IDE를 연결하여 실시간 코드 생성 및 수정을 지원합니다.",
  
  "project_type": ["Automation", "API"],
  "status": "completed",
  "priority": 10,
  
  "start_date": "2024-01-15",
  "end_date": "2024-03-20",
  "is_ongoing": false,
  
  "technologies": [
    { "name": "Python", "category": "Language", "version": "3.11" },
    { "name": "FastAPI", "category": "Backend", "version": "0.109" },
    { "name": "WebSocket", "category": "Backend" },
    { "name": "Claude API", "category": "AI" },
    { "name": "Docker", "category": "DevOps" }
  ],
  
  "features": [
    {
      "title": "멀티 에이전트 조율",
      "description": "여러 AI 에이전트가 협업하여 작업을 분담하고 결과를 통합"
    },
    {
      "title": "실시간 코드 동기화",
      "description": "Cursor IDE와 WebSocket으로 연결하여 실시간 코드 반영"
    },
    {
      "title": "작업 큐 관리",
      "description": "비동기 작업 큐로 대규모 작업도 안정적으로 처리"
    }
  ],
  
  "screenshots": [
    { "file": "dashboard.png", "caption": "메인 대시보드", "type": "desktop" },
    { "file": "workflow.png", "caption": "워크플로우 편집기", "type": "desktop" }
  ],
  
  "roles": [
    {
      "role_name": "Solo Developer",
      "responsibility": "기획, 설계, 개발, 배포 전체",
      "contribution_percentage": 100
    }
  ],
  
  "demo_url": "https://demo.ppop-code.com",
  "documentation_url": "https://docs.ppop-code.com",
  
  "challenges": "여러 AI 모델의 응답 시간이 다르고 예측 불가능하여, 비동기 처리와 타임아웃 관리에 많은 시행착오가 있었습니다.",
  "achievements": "평균 개발 시간 40% 단축, GitHub Stars 150+ 획득"
}
```

---

## AI에게 요청하는 방법

### 예시 프롬프트

```
다음 프로젝트의 portfolio/meta.json을 작성해줘:

프로젝트명: [프로젝트 이름]
설명: [프로젝트 설명]
사용 기술: [기술 스택 나열]
주요 기능: [기능들 설명]
개발 기간: [시작일 ~ 종료일]

위 schema.md와 guide.md 형식에 맞춰서 JSON으로 작성해줘.
```

---

## project_type 권장 값

- `Web` - 웹 애플리케이션
- `Mobile` - 모바일 앱  
- `Desktop` - 데스크톱 앱
- `Automation` - 자동화 도구
- `API` - API/백엔드
- `Library` - 라이브러리
- `CLI` - 커맨드라인 도구

---

## technology category 권장 값

- `Language` - Python, TypeScript, Go, Rust
- `Frontend` - React, Vue, Svelte, HTML/CSS
- `Backend` - FastAPI, Django, Express, Spring
- `Database` - PostgreSQL, MongoDB, Redis, SQLite
- `DevOps` - Docker, Kubernetes, AWS, GCP
- `AI` - OpenAI API, Claude API, LangChain
- `Tool` - Git, Webpack, Vite, ESLint
