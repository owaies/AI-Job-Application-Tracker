from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


def _validate_bcrypt_password_bytes(value: str) -> str:
    if len(value.encode("utf-8")) > 72:
        raise ValueError("Password must not exceed 72 UTF-8 bytes")
    return value


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: Optional[str] = Field(default=None, max_length=120)

    @field_validator("password")
    @classmethod
    def enforce_bcrypt_byte_limit(cls, value: str) -> str:
        return _validate_bcrypt_password_bytes(value)

    @field_validator("full_name", mode="before")
    @classmethod
    def normalize_full_name(cls, value):
        if value is None or not isinstance(value, str):
            return value
        cleaned = value.strip()
        return cleaned or None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    @field_validator("password")
    @classmethod
    def enforce_bcrypt_byte_limit(cls, value: str) -> str:
        return _validate_bcrypt_password_bytes(value)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
