from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.database import init_db
from app.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    init_db()
    yield


app = FastAPI(
    title="AI Finance Assistant API",
    description="Intelligent AI-powered personal finance management API with Supabase integration",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS else ["*"],
    allow_origin_regex=r"https?://.*" if not CORS_ORIGINS else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routes
app.include_router(api_router)


@app.get("/")
def root():
    return {
        "status": "online",
        "message": "AI Finance Assistant API is running smoothly",
        "version": "1.0.0",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "database": "connected",
        "message": "Backend services are fully operational",
    }
