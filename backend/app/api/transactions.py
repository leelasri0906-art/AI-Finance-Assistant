from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionResponse
from app.core.security import get_current_user
from app.services.ml_classifier import predict_category

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction_in: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    category = (transaction_in.category or "").strip()
    if not category:
        category = predict_category(
            transaction_in.description,
            transaction_type=transaction_in.transaction_type,
        )

    new_tx = Transaction(
        user_id=current_user.id,
        description=transaction_in.description.strip(),
        amount=float(transaction_in.amount),
        transaction_type=transaction_in.transaction_type.strip(),
        category=category,
        transaction_date=transaction_in.transaction_date.strip(),
    )
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)

    return new_tx


@router.get("", response_model=List[TransactionResponse])
def get_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.transaction_date.desc(), Transaction.id.desc())
        .all()
    )
    return transactions


@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction_in: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
        )
        .first()
    )
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    category = (transaction_in.category or "").strip()
    if not category:
        category = predict_category(
            transaction_in.description,
            transaction_type=transaction_in.transaction_type,
        )

    existing.description = transaction_in.description.strip()
    existing.amount = float(transaction_in.amount)
    existing.transaction_type = transaction_in.transaction_type.strip()
    existing.category = category
    existing.transaction_date = transaction_in.transaction_date.strip()

    db.commit()
    db.refresh(existing)
    return existing


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tx = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
        )
        .first()
    )
    if not tx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    db.delete(tx)
    db.commit()
    return {"message": "Transaction deleted successfully"}
