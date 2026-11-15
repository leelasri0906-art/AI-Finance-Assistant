from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.chat import ChatRequest, ChatResponse
from app.core.security import get_current_user
from app.services.chatbot_service import process_finance_chat

router = APIRouter(prefix="/api/chat", tags=["Chatbot"])


@router.post("", response_model=ChatResponse)
def finance_chat(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.transaction_date.desc(), Transaction.id.desc())
        .all()
    )
    reply_text = process_finance_chat(chat_request.message, transactions)
    return {"reply": reply_text}
