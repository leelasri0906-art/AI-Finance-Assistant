from pydantic import BaseModel

try:
    import email_validator  # noqa: F401
    from pydantic import EmailStr
except (ImportError, ModuleNotFoundError, Exception):
    EmailStr = str


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    email: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True
