"""
FastAPI Application Entrypoint for CallBrief Backend.
Supports Clerk Webhooks, WhipScribe API audio transcription,
Vertex AI Agentic Orchestration, and PostgreSQL Database Persistence with User-Scoped Auth.
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from whipscribe.db import Base, engine, webhook_router
from whipscribe.api.auth import get_current_user_id, verify_clerk_token
from whipscribe.api.schemas import (
    SettingsUpdateSchema,
    ItemUpdateSchema,
    ClientCreateSchema,
    ProjectCreateSchema,
    ProcessAgentRequestSchema,
    ConfirmationCreateSchema,
    ConfirmationUpdateSchema,
)
from whipscribe.api.routers.settings import router as settings_router
from whipscribe.api.routers.submissions import router as submissions_router
from whipscribe.api.routers.agent import router as agent_router
from whipscribe.api.routers.calls import router as calls_router
from whipscribe.api.routers.clients import router as clients_router
from whipscribe.api.routers.confirmations import router as confirmations_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("callbrief-backend")

app = FastAPI(
    title="CallBrief Backend API",
    description="Full backend service supporting user uploads, WhipScribe transcription, Vertex AI Agent orchestration, and PostgreSQL database storage.",
    version="1.0.0",
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Clerk webhook router
app.include_router(webhook_router)

# Include Modular Feature Routers
app.include_router(settings_router)
app.include_router(submissions_router)
app.include_router(agent_router)
app.include_router(calls_router)
app.include_router(clients_router)
app.include_router(confirmations_router)


@app.on_event("startup")
def on_startup():
    """Initializes database tables on startup."""
    try:
        logger.info("Initializing database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.warning(f"Database initialization note: {e}")


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "CallBrief Backend API"}
