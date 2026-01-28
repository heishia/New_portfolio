import json
from fastapi import APIRouter, HTTPException, Depends, Request
from datetime import datetime, timedelta
from typing import Optional
from user_agents import parse

from app.database import get_pool
from app.routers.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


def get_start_date(period: str) -> datetime:
    """기간에 따른 시작 날짜 계산"""
    now = datetime.utcnow()
    days = {
        "24h": 1,
        "7d": 7,
        "30d": 30,
        "90d": 90
    }.get(period, 7)
    return now - timedelta(days=days)


def format_duration(seconds: Optional[float]) -> str:
    """초를 읽기 쉬운 형식으로 변환"""
    if not seconds:
        return "0s"
    if seconds < 60:
        return f"{int(seconds)}s"
    mins = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{mins}m {secs}s"


@router.post("/collect")
async def collect_analytics(request: Request):
    """Analytics 데이터 수집 (공개 엔드포인트)"""
    try:
        data = await request.json()
        pool = get_pool()
        
        # User-Agent 파싱
        user_agent_str = request.headers.get("user-agent", "")
        user_agent = parse(user_agent_str)
        
        device_type = "mobile" if user_agent.is_mobile else ("tablet" if user_agent.is_tablet else "desktop")
        browser = user_agent.browser.family or "Unknown"
        os = user_agent.os.family or "Unknown"
        
        # IP에서 위치 정보 (간단히 처리)
        # 실제로는 ip-api.com 등 외부 서비스 사용 가능
        country = None
        city = None
        
        async with pool.acquire() as conn:
            event_type = data.get("type")
            
            if event_type == "pageview":
                # 페이지뷰 저장
                await conn.execute(
                    """
                    INSERT INTO page_views (
                        session_id, visitor_id, page_url, page_title, referrer,
                        device_type, browser, os, screen_width, screen_height,
                        country, city
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    """,
                    data.get("sessionId"),
                    data.get("visitorId"),
                    data.get("url"),
                    data.get("title"),
                    data.get("referrer"),
                    device_type,
                    browser,
                    os,
                    data.get("screen", {}).get("width"),
                    data.get("screen", {}).get("height"),
                    country,
                    city
                )
                
                # 세션 업데이트 또는 생성
                session_id = data.get("sessionId")
                existing = await conn.fetchrow(
                    "SELECT id FROM sessions WHERE id = $1",
                    session_id
                )
                
                if existing:
                    await conn.execute(
                        """
                        UPDATE sessions 
                        SET page_views = page_views + 1,
                            exit_page = $2,
                            is_bounce = FALSE
                        WHERE id = $1
                        """,
                        session_id,
                        data.get("url")
                    )
                else:
                    utm = data.get("utm", {})
                    await conn.execute(
                        """
                        INSERT INTO sessions (
                            id, visitor_id, entry_page, exit_page,
                            utm_source, utm_medium, utm_campaign
                        ) VALUES ($1, $2, $3, $3, $4, $5, $6)
                        """,
                        session_id,
                        data.get("visitorId"),
                        data.get("url"),
                        utm.get("source"),
                        utm.get("medium"),
                        utm.get("campaign")
                    )
            
            elif event_type == "event":
                # 커스텀 이벤트 저장
                event_data = data.get("data")
                event_data_json = json.dumps(event_data) if event_data else None
                await conn.execute(
                    """
                    INSERT INTO analytics_events (
                        session_id, visitor_id, event_name, event_data, page_url
                    ) VALUES ($1, $2, $3, $4, $5)
                    """,
                    data.get("sessionId"),
                    data.get("visitorId"),
                    data.get("name"),
                    event_data_json,
                    data.get("url")
                )
                
                # 참여 이벤트면 이탈 아님으로 처리
                engaging_events = ["scroll_depth", "click", "form_submit"]
                if data.get("name") in engaging_events:
                    await conn.execute(
                        "UPDATE sessions SET is_bounce = FALSE WHERE id = $1",
                        data.get("sessionId")
                    )
            
            elif event_type == "leave":
                # 페이지 이탈 처리
                await conn.execute(
                    """
                    UPDATE sessions 
                    SET ended_at = NOW(),
                        duration_seconds = $2,
                        exit_page = $3
                    WHERE id = $1
                    """,
                    data.get("sessionId"),
                    data.get("duration"),
                    data.get("url")
                )
                
                # 이탈 이벤트 저장
                leave_event_data = json.dumps({
                    "duration": data.get("duration"),
                    "activeTime": data.get("activeTime"),
                    "scrollDepth": data.get("scrollDepth")
                })
                await conn.execute(
                    """
                    INSERT INTO analytics_events (
                        session_id, visitor_id, event_name, event_data, page_url
                    ) VALUES ($1, $2, 'page_leave', $3, $4)
                    """,
                    data.get("sessionId"),
                    data.get("visitorId"),
                    leave_event_data,
                    data.get("url")
                )
        
        return {"success": True}
    
    except Exception as e:
        print(f"[Analytics] Error: {e}")
        return {"success": False}


@router.get("/stats")
async def get_stats(
    period: str = "7d",
    metric: str = "overview",
    user: dict = Depends(get_current_user)
):
    """Analytics 통계 조회 (관리자 전용)"""
    pool = get_pool()
    start_date = get_start_date(period)
    
    async with pool.acquire() as conn:
        if metric == "overview":
            # 요약 통계
            page_views = await conn.fetchval(
                "SELECT COUNT(*) FROM page_views WHERE created_at >= $1",
                start_date
            )
            
            sessions_count = await conn.fetchval(
                "SELECT COUNT(*) FROM sessions WHERE started_at >= $1",
                start_date
            )
            
            bounces = await conn.fetchval(
                "SELECT COUNT(*) FROM sessions WHERE started_at >= $1 AND is_bounce = TRUE",
                start_date
            )
            
            avg_duration = await conn.fetchval(
                """
                SELECT AVG(duration_seconds) FROM sessions 
                WHERE started_at >= $1 AND duration_seconds IS NOT NULL
                """,
                start_date
            )
            
            unique_visitors = await conn.fetchval(
                """
                SELECT COUNT(DISTINCT visitor_id) FROM page_views 
                WHERE created_at >= $1
                """,
                start_date
            )
            
            bounce_rate = (bounces / sessions_count * 100) if sessions_count > 0 else 0
            pages_per_session = (page_views / sessions_count) if sessions_count > 0 else 0
            
            # 일별 추이
            trend = await conn.fetch(
                """
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as page_views,
                    COUNT(DISTINCT visitor_id) as unique_visitors
                FROM page_views
                WHERE created_at >= $1
                GROUP BY DATE(created_at)
                ORDER BY date ASC
                """,
                start_date
            )
            
            return {
                "summary": {
                    "page_views": page_views,
                    "unique_visitors": unique_visitors,
                    "sessions": sessions_count,
                    "bounce_rate": f"{bounce_rate:.1f}%",
                    "avg_duration": format_duration(avg_duration),
                    "pages_per_session": f"{pages_per_session:.1f}"
                },
                "trend": [
                    {
                        "date": str(row["date"]),
                        "page_views": row["page_views"],
                        "unique_visitors": row["unique_visitors"]
                    }
                    for row in trend
                ]
            }
        
        elif metric == "pages":
            # 인기 페이지
            pages = await conn.fetch(
                """
                SELECT page_url, page_title, COUNT(*) as views
                FROM page_views
                WHERE created_at >= $1
                GROUP BY page_url, page_title
                ORDER BY views DESC
                LIMIT 20
                """,
                start_date
            )
            
            return {
                "pages": [
                    {
                        "url": row["page_url"],
                        "title": row["page_title"] or row["page_url"],
                        "views": row["views"]
                    }
                    for row in pages
                ]
            }
        
        elif metric == "sources":
            # 유입 경로
            referrers = await conn.fetch(
                """
                SELECT referrer, COUNT(*) as visits
                FROM page_views
                WHERE created_at >= $1 AND referrer IS NOT NULL AND referrer != ''
                GROUP BY referrer
                ORDER BY visits DESC
                LIMIT 10
                """,
                start_date
            )
            
            utm = await conn.fetch(
                """
                SELECT utm_source, utm_medium, COUNT(*) as sessions
                FROM sessions
                WHERE started_at >= $1 AND utm_source IS NOT NULL
                GROUP BY utm_source, utm_medium
                ORDER BY sessions DESC
                LIMIT 10
                """,
                start_date
            )
            
            return {
                "referrers": [
                    {
                        "source": extract_hostname(row["referrer"]) or "Direct",
                        "visits": row["visits"]
                    }
                    for row in referrers
                ],
                "utm": [
                    {
                        "source": row["utm_source"],
                        "medium": row["utm_medium"],
                        "sessions": row["sessions"]
                    }
                    for row in utm
                ]
            }
        
        elif metric == "realtime":
            # 실시간 통계 (최근 5분)
            five_minutes_ago = datetime.utcnow() - timedelta(minutes=5)
            
            active_visitors = await conn.fetchval(
                """
                SELECT COUNT(DISTINCT visitor_id) FROM page_views 
                WHERE created_at >= $1
                """,
                five_minutes_ago
            )
            
            recent = await conn.fetch(
                """
                SELECT page_url, page_title, country, created_at
                FROM page_views
                WHERE created_at >= $1
                ORDER BY created_at DESC
                LIMIT 20
                """,
                five_minutes_ago
            )
            
            return {
                "active_visitors": active_visitors,
                "recent_activity": [
                    {
                        "page": row["page_title"] or row["page_url"],
                        "country": row["country"],
                        "time": row["created_at"].isoformat()
                    }
                    for row in recent
                ]
            }
        
        elif metric == "exits":
            # 이탈 분석
            exit_pages = await conn.fetch(
                """
                SELECT exit_page, COUNT(*) as bounces
                FROM sessions
                WHERE started_at >= $1 AND is_bounce = TRUE AND exit_page IS NOT NULL
                GROUP BY exit_page
                ORDER BY bounces DESC
                LIMIT 10
                """,
                start_date
            )
            
            return {
                "top_exit_pages": [
                    {
                        "page": row["exit_page"],
                        "bounces": row["bounces"]
                    }
                    for row in exit_pages
                ]
            }
        
        else:
            raise HTTPException(status_code=400, detail="Invalid metric")


def extract_hostname(url: Optional[str]) -> Optional[str]:
    """URL에서 호스트명 추출"""
    if not url:
        return None
    try:
        from urllib.parse import urlparse
        return urlparse(url).hostname
    except:
        return url
