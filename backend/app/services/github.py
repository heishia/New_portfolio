import base64
import json
import logging
from datetime import datetime
from typing import Optional

import httpx

from app.config import get_settings
from app.schemas.repo import PortfolioMeta, Repository, Screenshot

logger = logging.getLogger(__name__)


class GitHubService:
    """Service for interacting with GitHub API."""
    
    BASE_URL = "https://api.github.com"
    RAW_URL = "https://raw.githubusercontent.com"
    
    def __init__(self):
        settings = get_settings()
        self.username = settings.github_username
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        if settings.github_token:
            self.headers["Authorization"] = f"Bearer {settings.github_token}"
    
    async def fetch_user_repos(self) -> list[dict]:
        """Fetch all repositories for the configured user (including private if token has 'repo' scope)."""
        settings = get_settings()
        repos = []
        page = 1
        per_page = 100
        
        async with httpx.AsyncClient() as client:
            while True:
                # If we have a token, use /user/repos to get ALL repos (including private)
                # Otherwise, use /users/{username}/repos for public only
                if settings.github_token:
                    url = f"{self.BASE_URL}/user/repos"
                    params = {
                        "visibility": "all",  # public, private, and internal
                        "affiliation": "owner",  # only repos owned by user
                        "sort": "updated",
                        "direction": "desc",
                        "per_page": per_page,
                        "page": page,
                    }
                else:
                    url = f"{self.BASE_URL}/users/{self.username}/repos"
                    params = {
                        "type": "owner",
                        "sort": "updated",
                        "direction": "desc",
                        "per_page": per_page,
                        "page": page,
                    }
                
                response = await client.get(
                    url, headers=self.headers, params=params
                )
                
                if response.status_code != 200:
                    logger.error(f"Failed to fetch repos: {response.status_code} - {response.text}")
                    break
                
                data = response.json()
                if not data:
                    break
                
                repos.extend(data)
                
                if len(data) < per_page:
                    break
                page += 1
        
        logger.info(f"Fetched {len(repos)} repositories (token: {'yes' if settings.github_token else 'no'})")
        return repos
    
    async def fetch_commit_count(self, owner: str, repo: str) -> int:
        """Fetch total commit count for a repository using contributors API."""
        async with httpx.AsyncClient() as client:
            # Use contributors API to sum all contributions
            url = f"{self.BASE_URL}/repos/{owner}/{repo}/contributors"
            params = {"per_page": 100, "anon": "true"}
            
            response = await client.get(url, headers=self.headers, params=params)
            
            if response.status_code != 200:
                # Fallback: try to get from commit count header
                commits_url = f"{self.BASE_URL}/repos/{owner}/{repo}/commits"
                commits_response = await client.get(
                    commits_url, 
                    headers=self.headers, 
                    params={"per_page": 1}
                )
                
                if commits_response.status_code == 200:
                    # Parse Link header to get total count
                    link_header = commits_response.headers.get("Link", "")
                    if 'rel="last"' in link_header:
                        import re
                        match = re.search(r'page=(\d+)>; rel="last"', link_header)
                        if match:
                            return int(match.group(1))
                return 0
            
            contributors = response.json()
            total_commits = sum(c.get("contributions", 0) for c in contributors)
            return total_commits
    
    async def fetch_code_stats(self, owner: str, repo: str) -> dict:
        """Fetch code statistics (languages/bytes) for a repository."""
        async with httpx.AsyncClient() as client:
            url = f"{self.BASE_URL}/repos/{owner}/{repo}/languages"
            
            response = await client.get(url, headers=self.headers)
            
            if response.status_code != 200:
                return {"total_bytes": 0, "estimated_lines": 0, "languages": {}}
            
            languages = response.json()
            total_bytes = sum(languages.values())
            
            # Estimate lines of code (rough: ~40 bytes per line on average)
            estimated_lines = total_bytes // 40
            
            return {
                "total_bytes": total_bytes,
                "estimated_lines": estimated_lines,
                "languages": languages,
            }
    
    async def fetch_contributor_count(self, owner: str, repo: str) -> int:
        """Fetch number of contributors for a repository."""
        async with httpx.AsyncClient() as client:
            url = f"{self.BASE_URL}/repos/{owner}/{repo}/contributors"
            params = {"per_page": 1, "anon": "true"}
            
            response = await client.get(url, headers=self.headers, params=params)
            
            if response.status_code != 200:
                return 1
            
            # Parse Link header to get total count
            link_header = response.headers.get("Link", "")
            if 'rel="last"' in link_header:
                import re
                match = re.search(r'page=(\d+)>; rel="last"', link_header)
                if match:
                    return int(match.group(1))
            
            # If no pagination, count the response
            contributors = response.json()
            return len(contributors) if isinstance(contributors, list) else 1
    
    async def fetch_portfolio_meta(
        self, owner: str, repo: str
    ) -> Optional[PortfolioMeta]:
        """Fetch portfolio/meta.json from a repository if it exists."""
        async with httpx.AsyncClient() as client:
            url = f"{self.BASE_URL}/repos/{owner}/{repo}/contents/portfolio/meta.json"
            
            response = await client.get(url, headers=self.headers)
            
            if response.status_code == 404:
                return None
            
            if response.status_code != 200:
                logger.warning(
                    f"Failed to fetch meta.json for {repo}: {response.status_code}"
                )
                return None
            
            try:
                content_data = response.json()
                # GitHub returns base64 encoded content
                content = base64.b64decode(content_data["content"]).decode("utf-8")
                meta_dict = json.loads(content)
                return self._parse_meta_json(meta_dict)
            except Exception as e:
                logger.error(f"Failed to parse meta.json for {repo}: {e}")
                return None
    
    def _parse_meta_json(self, data: dict) -> PortfolioMeta:
        """Parse meta.json structure into PortfolioMeta."""
        display = data.get("display", {})
        classification = data.get("classification", {})
        timeline = data.get("timeline", {})
        links = data.get("links", {})
        metrics = data.get("metrics", {})
        story = data.get("story", {})
        client = data.get("client", {})
        
        # New: architecture section
        architecture_section = data.get("architecture", {})
        
        return PortfolioMeta(
            title=display.get("title"),
            subtitle=display.get("subtitle"),
            description=display.get("description"),
            detailed_description=display.get("detailed_description"),
            project_type=classification.get("project_type", []),
            tags=classification.get("tags", []),
            status=classification.get("status", "completed"),
            priority=classification.get("priority", 0),
            start_date=timeline.get("start_date"),
            end_date=timeline.get("end_date"),
            is_ongoing=timeline.get("is_ongoing", False),
            technologies=data.get("technologies", []),
            features=data.get("features", []),
            screenshots=data.get("screenshots", []),
            demo_url=links.get("demo_url"),
            documentation_url=links.get("documentation_url"),
            lines_of_code=metrics.get("lines_of_code"),
            commit_count=metrics.get("commit_count"),
            contributor_count=metrics.get("contributor_count", 1),
            challenges=story.get("challenges"),
            achievements=story.get("achievements"),
            roles=data.get("roles", []),
            client_name=client.get("name") if isinstance(client, dict) else None,
            # New fields
            architecture=architecture_section.get("overview") if isinstance(architecture_section, dict) else None,
            system_components=architecture_section.get("system_components", []) if isinstance(architecture_section, dict) else [],
            core_principles=architecture_section.get("core_principles", []) if isinstance(architecture_section, dict) else [],
            auth_flow=architecture_section.get("auth_flow", []) if isinstance(architecture_section, dict) else [],
            data_models=architecture_section.get("data_models", []) if isinstance(architecture_section, dict) else [],
            technical_challenges=data.get("technical_challenges", []),
            key_achievements=data.get("key_achievements", []),
            code_snippets=data.get("code_snippets", []),
        )
    
    def build_screenshot_urls(
        self, owner: str, repo: str, screenshots: list[dict], branch: str = "main"
    ) -> list[dict]:
        """Build raw GitHub URLs for screenshots."""
        result = []
        for screenshot in screenshots:
            file_name = screenshot.get("file", "")
            url = f"{self.RAW_URL}/{owner}/{repo}/{branch}/portfolio/screenshots/{file_name}"
            result.append({
                **screenshot,
                "url": url,
            })
        return result
    
    def merge_repo_data(
        self, 
        github_repo: dict, 
        meta: Optional[PortfolioMeta],
        code_stats: Optional[dict] = None,
        commit_count: Optional[int] = None,
        contributor_count: Optional[int] = None,
    ) -> Repository:
        """Merge GitHub repo data with custom portfolio metadata and stats."""
        owner = github_repo["owner"]["login"]
        repo_name = github_repo["name"]
        
        # Parse GitHub dates
        github_created = None
        github_updated = None
        if github_repo.get("created_at"):
            github_created = datetime.fromisoformat(
                github_repo["created_at"].replace("Z", "+00:00")
            )
        if github_repo.get("updated_at"):
            github_updated = datetime.fromisoformat(
                github_repo["updated_at"].replace("Z", "+00:00")
            )
        
        # Base data from GitHub
        repo_data = {
            "id": github_repo["id"],
            "name": repo_name,
            "full_name": github_repo["full_name"],
            "description": github_repo.get("description"),
            "html_url": github_repo["html_url"],
            "language": github_repo.get("language"),
            "stargazers_count": github_repo.get("stargazers_count", 0),
            "topics": github_repo.get("topics", []),
            "github_created_at": github_created,
            "github_updated_at": github_updated,
            "has_portfolio_meta": meta is not None,
            "cached_at": datetime.utcnow(),
            # GitHub API stats (can be overridden by meta.json)
            "lines_of_code": code_stats.get("estimated_lines") if code_stats else None,
            "commit_count": commit_count,
            "contributor_count": contributor_count or 1,
            "languages": code_stats.get("languages", {}) if code_stats else {},
        }
        
        # Merge custom metadata if available
        if meta:
            screenshots_with_urls = self.build_screenshot_urls(
                owner, repo_name, 
                [s.model_dump() if hasattr(s, 'model_dump') else s for s in meta.screenshots]
            )
            
            repo_data.update({
                "title": meta.title or repo_name,
                "subtitle": meta.subtitle,
                "project_type": meta.project_type,
                "detailed_description": meta.detailed_description,
                "features": [f.model_dump() if hasattr(f, 'model_dump') else f for f in meta.features],
                "technologies": [t.model_dump() if hasattr(t, 'model_dump') else t for t in meta.technologies],
                "screenshots": screenshots_with_urls,
                "challenges": meta.challenges,
                "achievements": meta.achievements,
                "priority": meta.priority,
                "roles": [r.model_dump() if hasattr(r, 'model_dump') else r for r in meta.roles],
                "client_name": meta.client_name,
                "status": meta.status,
                "start_date": meta.start_date,
                "end_date": meta.end_date,
                "is_ongoing": meta.is_ongoing,
                "demo_url": meta.demo_url,
                "documentation_url": meta.documentation_url,
                # Metrics: prefer meta.json values, fallback to GitHub API stats
                "lines_of_code": meta.lines_of_code or repo_data.get("lines_of_code"),
                "commit_count": meta.commit_count or repo_data.get("commit_count"),
                "contributor_count": meta.contributor_count or repo_data.get("contributor_count", 1),
                # New fields
                "architecture": meta.architecture,
                "system_components": [s.model_dump() if hasattr(s, 'model_dump') else s for s in meta.system_components],
                "core_principles": [p.model_dump() if hasattr(p, 'model_dump') else p for p in meta.core_principles],
                "auth_flow": meta.auth_flow,
                "data_models": [d.model_dump() if hasattr(d, 'model_dump') else d for d in meta.data_models],
                "technical_challenges": [c.model_dump() if hasattr(c, 'model_dump') else c for c in meta.technical_challenges],
                "key_achievements": meta.key_achievements,
                "code_snippets": [s.model_dump() if hasattr(s, 'model_dump') else s for s in meta.code_snippets],
            })
        else:
            # Use GitHub data as fallback
            repo_data.update({
                "title": repo_name,
                "project_type": [],
                "features": [],
                "technologies": [],
                "screenshots": [],
                "roles": [],
                # New fields default
                "architecture": None,
                "system_components": [],
                "core_principles": [],
                "auth_flow": [],
                "data_models": [],
                "technical_challenges": [],
                "key_achievements": [],
                "code_snippets": [],
            })
        
        return Repository(**repo_data)
    
    async def fetch_all_repos_with_meta(self) -> list[Repository]:
        """Fetch all repos and their portfolio metadata with stats."""
        github_repos = await self.fetch_user_repos()
        repositories = []
        
        for github_repo in github_repos:
            # Skip forks by default
            if github_repo.get("fork", False):
                continue
            
            owner = github_repo["owner"]["login"]
            repo_name = github_repo["name"]
            
            # Try to fetch portfolio metadata
            meta = await self.fetch_portfolio_meta(owner, repo_name)
            
            # Fetch additional stats from GitHub API
            code_stats = await self.fetch_code_stats(owner, repo_name)
            commit_count = await self.fetch_commit_count(owner, repo_name)
            contributor_count = await self.fetch_contributor_count(owner, repo_name)
            
            # Merge data with stats
            repo = self.merge_repo_data(
                github_repo, 
                meta,
                code_stats=code_stats,
                commit_count=commit_count,
                contributor_count=contributor_count,
            )
            repositories.append(repo)
        
        # Sort by priority (higher first), then by updated date
        repositories.sort(
            key=lambda r: (r.priority, r.github_updated_at or datetime.min),
            reverse=True,
        )
        
        return repositories


# Singleton instance
github_service = GitHubService()
