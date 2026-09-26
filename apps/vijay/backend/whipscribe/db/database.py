"""
Database session and engine setup for WhipScribe CallBrief backend.
Supports PostgreSQL (default) and SQLite fallback for local development.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

logger = logging.getLogger("callbrief-db")

DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")

is_vercel = os.getenv("VERCEL") or os.getenv("VERCEL_ENV")

if not DATABASE_URL:
    if is_vercel:
        logger.warning(
            "WARNING: DATABASE_URL is not set on Vercel. Falling back to temporary SQLite /tmp/callbrief.db. "
            "Data will reset on serverless function recycles. Configure Postgres DATABASE_URL for permanent persistence."
        )
        DATABASE_URL = "sqlite:////tmp/callbrief.db"
    else:
        DATABASE_URL = "sqlite:///./callbrief.db"

# Convert postgres:// or postgresql:// to explicit postgresql+psycopg2:// driver if needed
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgresql+"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

# Configure Engine
if "sqlite" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
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
