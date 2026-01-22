# Portfolio Meta.json 스키마

GitHub에서 자동으로 받아오는 정보를 **제외**한, 직접 관리하는 커스텀 메타데이터 필드입니다.

---

## 기본 정보

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| `title` | string | ✅ | 프로젝트 표시 제목 |
| `subtitle` | string | | 부제목 |
| `detailed_description` | string | | 상세 설명 (마크다운 가능) |

---

## 분류

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| `project_type` | string[] | ✅ | 프로젝트 유형 |
| `status` | string | | `completed`, `in_progress`, `archived` |
| `priority` | number | | 표시 우선순위 (높을수록 먼저) |

---

## 일정

| 필드 | 타입 | 설명 |
|------|------|------|
| `start_date` | date | 시작일 (YYYY-MM-DD) |
| `end_date` | date | 종료일 |
| `is_ongoing` | boolean | 진행 중 여부 |

---

## 기술 스택 (technologies)

```json
{
  "technologies": [
    {
      "name": "React",        // 필수
      "category": "Frontend", // 필수
      "version": "18.2"       // 선택
    }
  ]
}
```

---

## 기능 목록 (features)

```json
{
  "features": [
    {
      "title": "실시간 동기화",  // 필수
      "description": "설명..."  // 필수
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
      "file": "main.png",    // 필수: portfolio/screenshots/ 내 파일명
      "caption": "메인 화면", // 필수
      "type": "desktop"      // 선택: desktop | mobile | video
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
      "role_name": "Full Stack Developer",
      "responsibility": "전체 개발 담당",
      "contribution_percentage": 100
    }
  ]
}
```

---

## 링크

| 필드 | 타입 | 설명 |
|------|------|------|
| `demo_url` | string | 데모 사이트 URL |
| `documentation_url` | string | 문서 URL |

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
| `client_name` | string | 클라이언트명 (외주) |
| `lines_of_code` | number | 코드 라인 수 |
| `commit_count` | number | 커밋 수 |
| `contributor_count` | number | 기여자 수 |
