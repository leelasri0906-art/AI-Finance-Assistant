from pydantic import BaseModel


class BudgetCreate(BaseModel):
    category: str
    amount: float
    month: str  # YYYY-MM


class BudgetResponse(BaseModel):
    id: int
    category: str
    amount: float
    month: str

    class Config:
        from_attributes = True


class BudgetProgressResponse(BaseModel):
    id: int
    category: str
    amount: float
    month: str
    spent: float
    remaining: float
    percentage: float
