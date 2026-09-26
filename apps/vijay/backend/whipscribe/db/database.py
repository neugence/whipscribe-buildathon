"""
Database session and engine setup for WhipScribe CallBrief backend.
Supports PostgreSQL (default) and SQLite fallback for local development.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:1234@localhost:5432/callbrief"
)

# On Vercel Serverless, if no external DATABASE_URL is set or points to localhost, fallback to SQLite in /tmp
is_vercel = os.getenv("VERCEL") or os.getenv("VERCEL_ENV")
if is_vercel and ("localhost" in DATABASE_URL or "127.0.0.1" in DATABASE_URL):
    DATABASE_URL = "sqlite:////tmp/callbrief.db"

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
