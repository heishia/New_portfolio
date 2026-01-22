# 📦 포트폴리오 메타데이터 템플릿

## 사용 방법

1. `portfolio` 폴더를 통째로 복사
2. 프로젝트 레포지토리 루트에 붙여넣기
3. `meta.json` 수정 (또는 `meta.minimal.json`을 `meta.json`으로 이름 변경)
4. `screenshots/` 폴더에 스크린샷 추가
5. Git push!

```
your-repo/
├── portfolio/           ← 이 폴더를 복사!
│   ├── meta.json
│   └── screenshots/
│       └── main.png
├── src/
└── README.md
```

## 파일 설명

| 파일 | 설명 |
|------|------|
| `meta.json` | 전체 필드 포함 (권장) |
| `meta.minimal.json` | 최소 필드만 (빠르게 시작) |

## project_type 옵션

- `web` - 웹 애플리케이션
- `mobile` - 모바일 앱
- `desktop` - 데스크톱 앱
- `automation` - 자동화 프로그램
- `api` - 백엔드 API
- `library` - 라이브러리/패키지

## priority 가이드

- `10` - 최상단 표시 (대표 프로젝트)
- `5` - 중요 프로젝트
- `0` - 기본값
- `-5` - 하단 표시

## 스크린샷 가이드

- **main.png** (필수) - 메인 화면
- **feature-xx.png** - 기능 화면들
- **mobile.png** - 모바일 화면
- **demo.mp4** - 데모 영상 (지원!)

권장 해상도: 1920x1080 또는 1280x720
