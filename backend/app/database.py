import logging
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import DATABASE_URL

logger = logging.getLogger("uvicorn.error")

normalized_url = DATABASE_URL
if normalized_url.startswith("postgres://"):
    normalized_url = normalized_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif normalized_url.startswith("postgresql://") and not normalized_url.startswith("postgresql+"):
    normalized_url = normalized_url.replace("postgresql://", "postgresql+psycopg2://", 1)

if "sqlite" in normalized_url:
    engine = create_engine(
        normalized_url,
        connect_args={"check_same_thread": False},
    )
elif normalized_url:
    engine = create_engine(
        normalized_url,
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args={"sslmode": "require"},
    )
else:
    # Local fallback
    sqlite_path = Path(__file__).resolve().parent.parent / "finance.db"
    engine = create_engine(
        f"sqlite:///{sqlite_path.as_posix()}",
        connect_args={"check_same_thread": False},
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables in the database if they do not exist."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified successfully.")
    except Exception as exc:
        logger.error(f"Error initializing database: {exc}")
        raise
