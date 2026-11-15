from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.budget import Budget
from app.models.transaction import Transaction
from app.schemas.budget import BudgetCreate, BudgetResponse, BudgetProgressResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/api/budgets", tags=["Budgets"])


@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(
    budget_in: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Check if budget already exists for this category and month
    existing = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.category == budget_in.category.strip(),
            Budget.month == budget_in.month.strip(),
        )
        .first()
    )
    if existing:
        existing.amount = float(budget_in.amount)
        db.commit()
        db.refresh(existing)
        return existing

    new_budget = Budget(
        user_id=current_user.id,
        category=budget_in.category.strip(),
        amount=float(budget_in.amount),
        month=budget_in.month.strip(),
    )
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)

    return new_budget


@router.get("", response_model=List[BudgetProgressResponse])
def get_budgets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budgets = (
        db.query(Budget)
        .filter(Budget.user_id == current_user.id)
        .order_by(Budget.month.desc(), Budget.id.desc())
        .all()
    )

    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == "Expense",
        )
        .all()
    )

    results = []
    for b in budgets:
        spent = sum(
            t.amount for t in transactions
            if (t.category or "").lower() == (b.category or "").lower()
            and (t.transaction_date or "")[:7] == b.month
        )
        remaining = b.amount - spent
        percentage = (spent / b.amount * 100) if b.amount > 0 else 0.0

        results.append({
            "id": b.id,
            "category": b.category,
            "amount": round(b.amount, 2),
            "month": b.month,
            "spent": round(spent, 2),
            "remaining": round(remaining, 2),
            "percentage": round(percentage, 2),
        })

    return results


@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = (
        db.query(Budget)
        .filter(
            Budget.id == budget_id,
            Budget.user_id == current_user.id,
        )
        .first()
    )
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found",
        )

    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted successfully"}
