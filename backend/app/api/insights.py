from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.core.security import get_current_user
from app.services.insights_service import generate_financial_insights

router = APIRouter(prefix="/api/insights", tags=["Insights"])


@router.get("")
def get_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .all()
    )
    return generate_financial_insights(transactions)
