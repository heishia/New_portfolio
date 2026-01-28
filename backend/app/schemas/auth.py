from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    token: str
    user: "UserResponse"


class UserResponse(BaseModel):
    id: int
    email: str
    name: Optional[str] = None


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class MeResponse(BaseModel):
    user: UserResponse
