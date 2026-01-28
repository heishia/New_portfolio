#!/usr/bin/env python3
"""
초기 관리자 계정 생성 스크립트

사용법:
    python scripts/create_admin.py <email> <password> [name]
    
예시:
    python scripts/create_admin.py admin@example.com mypassword123 "Admin User"
"""

import sys
import asyncio
import os

# 상위 디렉토리를 path에 추가
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import init_db, close_db, get_pool
from app.services.auth import hash_password


async def create_admin(email: str, password: str, name: str = None):
    """관리자 계정 생성"""
    await init_db()
    
    try:
        pool = get_pool()
        password_hash = hash_password(password)
        
        async with pool.acquire() as conn:
            # 이미 존재하는지 확인
            existing = await conn.fetchrow(
                "SELECT id FROM admin_users WHERE email = $1",
                email
            )
            
            if existing:
                print(f"Error: User with email '{email}' already exists.")
                return False
            
            # 새 관리자 생성
            row = await conn.fetchrow(
                """
                INSERT INTO admin_users (email, password_hash, name)
                VALUES ($1, $2, $3)
                RETURNING id, email, name
                """,
                email, password_hash, name
            )
            
            print(f"Admin user created successfully!")
            print(f"  ID: {row['id']}")
            print(f"  Email: {row['email']}")
            print(f"  Name: {row['name'] or '(not set)'}")
            return True
            
    finally:
        await close_db()


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    name = sys.argv[3] if len(sys.argv) > 3 else None
    
    if len(password) < 6:
        print("Error: Password must be at least 6 characters long.")
        sys.exit(1)
    
    success = asyncio.run(create_admin(email, password, name))
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
