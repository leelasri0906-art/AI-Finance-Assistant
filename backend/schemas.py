from pydantic import BaseModel, EmailStr
from typing import Optional


# =========================================================
# USER
# =========================================================

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    name: str
    email: str


# =========================================================
# TRANSACTIONS
# =========================================================

class TransactionCreate(BaseModel):
    description: str
    amount: float
    transaction_type: str
    transaction_date: str
    category: Optional[str] = None


class TransactionResponse(BaseModel):
    id: int
    description: str
    amount: float
    transaction_type: str
    category: str
    transaction_date: str

    class Config:
        from_attributes = True


# =========================================================
# BUDGET
# =========================================================

class BudgetCreate(BaseModel):
    category: str
    amount: float
    month: str


class BudgetResponse(BaseModel):
    id: int
    category: str
    amount: float
    month: str

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str