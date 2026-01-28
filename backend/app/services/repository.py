import json
import logging
from datetime import datetime
from typing import Optional

from app.database import get_connection
from app.schemas.repo import Repository

logger = logging.getLogger(__name__)


class RepositoryService:
    """Service for repository database operations."""
    
    async def get_all(self) -> list[Repository]:
        """Get all cached repositories ordered by priority."""
        async with get_connection() as conn:
            rows = await conn.fetch("""
                SELECT * FROM repositories
                ORDER BY priority DESC, github_updated_at DESC NULLS LAST
            """)
            
            return [self._row_to_repo(row) for row in rows]
    
    async def get_by_id(self, repo_id: int) -> Optional[Repository]:
        """Get a single repository by ID."""
        async with get_connection() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM repositories WHERE id = $1",
                repo_id
            )
            
            if row:
                return self._row_to_repo(row)
            return None
    
    async def upsert(self, repo: Repository) -> Repository:
        """Insert or update a repository."""
        async with get_connection() as conn:
            await conn.execute("""
                INSERT INTO repositories (
                    id, name, full_name, description, html_url, language,
                    stargazers_count, topics, github_created_at, github_updated_at,
                    title, subtitle, project_type, detailed_description,
                    features, technologies, screenshots, challenges, achievements,
                    priority, roles, client_name, status, start_date, end_date,
                    is_ongoing, demo_url, documentation_url, lines_of_code,
                    commit_count, contributor_count, languages, has_portfolio_meta, cached_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                    $11, $12, $13, $14, $15, $16, $17, $18, $19,
                    $20, $21, $22, $23, $24, $25, $26, $27, $28,
                    $29, $30, $31, $32, $33, $34
                )
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    full_name = EXCLUDED.full_name,
                    description = EXCLUDED.description,
                    html_url = EXCLUDED.html_url,
                    language = EXCLUDED.language,
                    stargazers_count = EXCLUDED.stargazers_count,
                    topics = EXCLUDED.topics,
                    github_created_at = EXCLUDED.github_created_at,
                    github_updated_at = EXCLUDED.github_updated_at,
                    title = EXCLUDED.title,
                    subtitle = EXCLUDED.subtitle,
                    project_type = EXCLUDED.project_type,
                    detailed_description = EXCLUDED.detailed_description,
                    features = EXCLUDED.features,
                    technologies = EXCLUDED.technologies,
                    screenshots = EXCLUDED.screenshots,
                    challenges = EXCLUDED.challenges,
                    achievements = EXCLUDED.achievements,
                    priority = EXCLUDED.priority,
                    roles = EXCLUDED.roles,
                    client_name = EXCLUDED.client_name,
                    status = EXCLUDED.status,
                    start_date = EXCLUDED.start_date,
                    end_date = EXCLUDED.end_date,
                    is_ongoing = EXCLUDED.is_ongoing,
                    demo_url = EXCLUDED.demo_url,
                    documentation_url = EXCLUDED.documentation_url,
                    lines_of_code = EXCLUDED.lines_of_code,
                    commit_count = EXCLUDED.commit_count,
                    contributor_count = EXCLUDED.contributor_count,
                    languages = EXCLUDED.languages,
                    has_portfolio_meta = EXCLUDED.has_portfolio_meta,
                    cached_at = EXCLUDED.cached_at
            """,
                repo.id,
                repo.name,
                repo.full_name,
                repo.description,
                repo.html_url,
                repo.language,
                repo.stargazers_count,
                repo.topics,
                repo.github_created_at,
                repo.github_updated_at,
                repo.title,
                repo.subtitle,
                repo.project_type,
                repo.detailed_description,
                json.dumps(repo.features),
                json.dumps(repo.technologies),
                json.dumps(repo.screenshots),
                repo.challenges,
                repo.achievements,
                repo.priority,
                json.dumps(repo.roles),
                repo.client_name,
                repo.status,
                repo.start_date,
                repo.end_date,
                repo.is_ongoing,
                repo.demo_url,
                repo.documentation_url,
                repo.lines_of_code,
                repo.commit_count,
                repo.contributor_count,
                json.dumps(repo.languages),
                repo.has_portfolio_meta,
                repo.cached_at or datetime.utcnow(),
            )
            
            return repo
    
    async def upsert_many(self, repos: list[Repository]) -> int:
        """Insert or update multiple repositories."""
        count = 0
        for repo in repos:
            try:
                await self.upsert(repo)
                count += 1
            except Exception as e:
                logger.error(f"Failed to upsert repo {repo.name}: {e}")
        return count
    
    async def delete(self, repo_id: int) -> bool:
        """Delete a repository by ID."""
        async with get_connection() as conn:
            result = await conn.execute(
                "DELETE FROM repositories WHERE id = $1",
                repo_id
            )
            return result == "DELETE 1"
    
    async def get_last_updated(self) -> Optional[datetime]:
        """Get the most recent cached_at timestamp."""
        async with get_connection() as conn:
            row = await conn.fetchrow(
                "SELECT MAX(cached_at) as last_updated FROM repositories"
            )
            return row["last_updated"] if row else None
    
    async def get_count(self) -> int:
        """Get total repository count."""
        async with get_connection() as conn:
            row = await conn.fetchrow("SELECT COUNT(*) as count FROM repositories")
            return row["count"] if row else 0
    
    def _parse_json_field(self, value, default=None):
        """Parse JSON field from database (handles both string and already parsed values)."""
        if default is None:
            default = []
        if value is None:
            return default
        if isinstance(value, (list, dict)):
            return value
        if isinstance(value, str):
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return default
        return default
    
    def _row_to_repo(self, row) -> Repository:
        """Convert database row to Repository model."""
        return Repository(
            id=row["id"],
            name=row["name"],
            full_name=row["full_name"],
            description=row["description"],
            html_url=row["html_url"],
            language=row["language"],
            stargazers_count=row["stargazers_count"],
            topics=row["topics"] or [],
            github_created_at=row["github_created_at"],
            github_updated_at=row["github_updated_at"],
            title=row["title"],
            subtitle=row["subtitle"],
            project_type=self._parse_json_field(row["project_type"]),
            detailed_description=row["detailed_description"],
            features=self._parse_json_field(row["features"]),
            technologies=self._parse_json_field(row["technologies"]),
            screenshots=self._parse_json_field(row["screenshots"]),
            challenges=row["challenges"],
            achievements=row["achievements"],
            priority=row["priority"] or 0,
            roles=self._parse_json_field(row["roles"]),
            client_name=row["client_name"],
            status=row["status"] or "completed",
            start_date=row["start_date"],
            end_date=row["end_date"],
            is_ongoing=row["is_ongoing"] or False,
            demo_url=row["demo_url"],
            documentation_url=row["documentation_url"],
            lines_of_code=row["lines_of_code"],
            commit_count=row["commit_count"],
            contributor_count=row["contributor_count"] or 1,
            languages=self._parse_json_field(row.get("languages"), {}),
            has_portfolio_meta=row["has_portfolio_meta"] or False,
            cached_at=row["cached_at"],
        )


# Singleton instance
repository_service = RepositoryService()
