from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.transactions import router as transactions_router
from app.api.budgets import router as budgets_router
from app.api.dashboard import router as dashboard_router
from app.api.analytics import router as analytics_router
from app.api.prediction import router as prediction_router
from app.api.insights import router as insights_router
from app.api.chat import router as chat_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(transactions_router)
api_router.include_router(budgets_router)
api_router.include_router(dashboard_router)
api_router.include_router(analytics_router)
api_router.include_router(prediction_router)
api_router.include_router(insights_router)
api_router.include_router(chat_router)

__all__ = ["api_router"]
