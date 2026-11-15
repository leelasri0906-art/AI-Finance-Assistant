import os
from pathlib import Path

# Load .env file from backend directory if present
try:
    from dotenv import load_dotenv
    backend_env_path = Path(__file__).resolve().parent.parent / ".env"
    if backend_env_path.exists():
        load_dotenv(backend_env_path)
    else:
        root_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
        if root_env_path.exists():
            load_dotenv(root_env_path)
except ImportError:
    pass

# Supabase PostgreSQL Database URL
DEFAULT_DATABASE_URL = "postgresql://postgres:leelasri0906-art@db.ojudlovqsoavqqjwtdfg.supabase.co:5432/postgres"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL).strip()

# Secret Key for JWT Authentication
DEFAULT_SECRET_KEY = "GHF0dRcoOcGCl7imL6Z0WQzyPwHcjX5EpNPNkPrqVyqGzU1YegjGwEaNWRXvx1AI"
SECRET_KEY = os.getenv("SECRET_KEY", DEFAULT_SECRET_KEY).strip()

# JWT Algorithm and Expiration
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24)))

# CORS Origins
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://ai-finance-assistant-frontend-u41m.onrender.com",
]

# Additional origins from environment
EXTRA_ORIGINS = os.getenv("CORS_ORIGINS", "")
if EXTRA_ORIGINS:
    for origin in EXTRA_ORIGINS.split(","):
        trimmed = origin.strip()
        if trimmed and trimmed not in CORS_ORIGINS:
            CORS_ORIGINS.append(trimmed)
