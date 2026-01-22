# Portfolio Database Schema

GitHub에서 자동으로 받아오는 정보를 **제외**한, 직접 관리하는 커스텀 메타데이터 필드입니다.

---

## 기본 정보

| 필드 | 타입 | 필수 | 설명 | 예시 |
|------|------|:----:|------|------|
| `title` | string | ✅ | 프로젝트 표시 제목 | `"AI 오케스트레이션 프레임워크"` |
| `subtitle` | string | | 부제목 | `"Claude + Cursor 연동"` |
| `detailed_description` | string | | 상세 설명 (마크다운 가능) | `"이 프로젝트는..."` |

---

## 분류

| 필드 | 타입 | 필수 | 설명 | 예시 |
|------|------|:----:|------|------|
| `project_type` | string[] | ✅ | 프로젝트 유형 | `["Web", "Automation"]` |
| `status` | string | | 상태 | `"completed"`, `"in_progress"`, `"archived"` |
| `priority` | number | | 표시 우선순위 (높을수록 먼저) | `10` |

### project_type 권장 값
- `Web` - 웹 애플리케이션
- `Mobile` - 모바일 앱
- `Desktop` - 데스크톱 애플리케이션
- `Automation` - 자동화 도구/스크립트
- `API` - API/백엔드 서비스
- `Library` - 라이브러리/패키지
- `CLI` - 커맨드라인 도구

---

## 일정

| 필드 | 타입 | 필수 | 설명 | 예시 |
|------|------|:----:|------|------|
| `start_date` | date | | 시작일 (YYYY-MM-DD) | `"2024-01-15"` |
| `end_date` | date | | 종료일 | `"2024-03-20"` |
| `is_ongoing` | boolean | | 진행 중 여부 | `true` |

---

## 기술 스택 (technologies)

```json
{
  "technologies": [
    {
      "name": "React",        // 필수: 기술명
      "category": "Frontend", // 필수: 카테고리
      "version": "18.2"       // 선택: 버전
    }
  ]
}
```

### category 권장 값
- `Frontend` - React, Vue, Angular, HTML/CSS
- `Backend` - FastAPI, Django, Express, Spring
- `Database` - PostgreSQL, MongoDB, Redis
- `DevOps` - Docker, Kubernetes, AWS
- `Language` - Python, TypeScript, Go
- `Tool` - Git, Webpack, Vite

---

## 기능 목록 (features)

```json
{
  "features": [
    {
      "title": "실시간 동기화",           // 필수: 기능명
      "description": "WebSocket 기반..." // 필수: 설명
    }
  ]
}
```

---

## 스크린샷 (screenshots)

```json
{
  "screenshots": [
    {
      "file": "main.png",      // 필수: 파일명 (portfolio/screenshots/ 내)
      "caption": "메인 화면",   // 필수: 캡션
      "type": "desktop",       // 선택: "desktop" | "mobile" | "tablet"
      "url": "https://..."     // 선택: 외부 URL (file 대신 사용)
    }
  ]
}
```

---

## 역할 (roles)

```json
{
  "roles": [
    {
      "role_name": "Full Stack Developer",  // 필수: 역할명
      "responsibility": "전체 개발 담당",    // 선택: 책임
      "contribution_percentage": 100        // 선택: 기여도 (%)
    }
  ]
}
```

---

## 링크

| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `demo_url` | string | 데모 사이트 URL | `"https://demo.example.com"` |
| `documentation_url` | string | 문서 URL | `"https://docs.example.com"` |

---

## 스토리

| 필드 | 타입 | 설명 |
|------|------|------|
| `challenges` | string | 어려웠던 점, 도전 과제 |
| `achievements` | string | 성과, 결과물 |

---

## 기타

| 필드 | 타입 | 설명 |
|------|------|------|
| `client_name` | string | 클라이언트/고객명 (외주 프로젝트인 경우) |
| `lines_of_code` | number | 코드 라인 수 |
| `commit_count` | number | 커밋 수 |
| `contributor_count` | number | 기여자 수 (기본값: 1) |
