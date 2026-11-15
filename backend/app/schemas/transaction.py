from pydantic import BaseModel
from typing import Optional


class TransactionCreate(BaseModel):
    description: str
    amount: float
    transaction_type: str  # "Income" or "Expense"
    transaction_date: str  # YYYY-MM-DD
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
