import secrets
import bcrypt
from datetime import datetime, timedelta
from typing import Optional

from app.database import get_pool

# 토큰 만료 시간 (7일)
TOKEN_EXPIRE_DAYS = 7


def hash_password(password: str) -> str:
    """비밀번호 해싱"""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """비밀번호 검증"""
    try:
        password_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        return False


def generate_token() -> str:
    """세션 토큰 생성"""
    return secrets.token_urlsafe(32)


async def get_user_by_email(email: str) -> Optional[dict]:
    """이메일로 사용자 조회"""
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id, email, password_hash, name FROM admin_users WHERE email = $1",
            email
        )
        if row:
            return dict(row)
        return None


async def get_user_by_id(user_id: int) -> Optional[dict]:
    """ID로 사용자 조회"""
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id, email, name FROM admin_users WHERE id = $1",
            user_id
        )
        if row:
            return dict(row)
        return None


async def create_user(email: str, password: str, name: Optional[str] = None) -> dict:
    """새 관리자 사용자 생성"""
    pool = get_pool()
    password_hash = hash_password(password)
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO admin_users (email, password_hash, name)
            VALUES ($1, $2, $3)
            RETURNING id, email, name
            """,
            email, password_hash, name
        )
        return dict(row)


async def create_session(user_id: int) -> str:
    """새 세션 생성"""
    pool = get_pool()
    token = generate_token()
    expires_at = datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS)
    
    async with pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO admin_sessions (user_id, token, expires_at)
            VALUES ($1, $2, $3)
            """,
            user_id, token, expires_at
        )
    
    return token


async def get_session(token: str) -> Optional[dict]:
    """토큰으로 세션 조회"""
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT s.user_id, s.expires_at, u.id, u.email, u.name
            FROM admin_sessions s
            JOIN admin_users u ON s.user_id = u.id
            WHERE s.token = $1 AND s.expires_at > NOW()
            """,
            token
        )
        if row:
            return {
                "user_id": row["user_id"],
                "expires_at": row["expires_at"],
                "user": {
                    "id": row["id"],
                    "email": row["email"],
                    "name": row["name"]
                }
            }
        return None


async def delete_session(token: str) -> bool:
    """세션 삭제 (로그아웃)"""
    pool = get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute(
            "DELETE FROM admin_sessions WHERE token = $1",
            token
        )
        return "DELETE" in result


async def cleanup_expired_sessions():
    """만료된 세션 정리"""
    pool = get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "DELETE FROM admin_sessions WHERE expires_at < NOW()"
        )


async def authenticate_user(email: str, password: str) -> Optional[dict]:
    """사용자 인증"""
    user = await get_user_by_email(email)
    if not user:
        return None
    
    if not verify_password(password, user["password_hash"]):
        return None
    
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"]
    }
