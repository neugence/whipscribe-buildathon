"""
Database session and engine setup for WhipScribe CallBrief backend.
Supports PostgreSQL (default) and SQLite fallback for local development.
"""

import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from whipscribe.settings import settings

logger = logging.getLogger("callbrief-db")

# URL resolution (driver normalisation + Vercel/SQLite fallback) is
# handled centrally by settings.effective_database_url
DATABASE_URL = settings.effective_database_url

if settings.vercel or settings.vercel_env:
    logger.warning(
        "WARNING: Running on Vercel without a DATABASE_URL. "
        "Falling back to SQLite /tmp/callbrief.db — data resets on cold starts. "
        "Configure a Postgres DATABASE_URL for permanent persistence."
    )

# Configure Engine
if "sqlite" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency for database session management."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
