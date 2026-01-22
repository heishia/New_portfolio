# Portfolio Website

GitHub 레포지토리 자동 동기화 기능이 포함된 개인 포트폴리오 웹사이트.

## Architecture

```
Frontend (React/Vite) ──> Backend (FastAPI) ──> PostgreSQL
                              │
                              └──> GitHub API
```

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL

### Development

```bash
# Frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `GITHUB_TOKEN` - GitHub Personal Access Token
- `GITHUB_USERNAME` - Your GitHub username

## Project Structure

```
├── src/                    # Frontend (React)
├── backend/                # Backend (FastAPI)
│   └── app/
│       ├── routers/        # API endpoints
│       ├── services/       # Business logic
│       └── schemas/        # Pydantic models
├── database/               # SQL schemas
├── docs/                   # Documentation
│   └── portfolio-template/ # Portfolio metadata template
└── .github/workflows/      # CI/CD
```

## Features

- GitHub repository auto-sync (daily)
- Custom portfolio metadata via `portfolio/meta.json`
- Manual refresh button
- Search and filter projects

## Deployment

Deployed on Railway. See `railway.toml` for configuration.

## Documentation

- [Portfolio Template Guide](docs/portfolio-template/README.md)
