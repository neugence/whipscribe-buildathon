"""
Clerk Webhook Router using Svix Verification.
Handles user.created, user.updated, and user.deleted events to sync users into PostgreSQL/SQLite.
Exposes endpoint compatible with Svix CLI (`svix listen http://localhost:8000/api/webhooks/clerk`).
"""

import logging
from fastapi import APIRouter, Request, HTTPException, Depends, status
from sqlalchemy.orm import Session
try:
    from svix.webhooks import Webhook, WebhookVerificationError
except ImportError:
    Webhook = None
    WebhookVerificationError = Exception
from .database import get_db
from .crud import upsert_user_from_clerk, delete_user_from_clerk
from whipscribe.settings import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])


@router.post("/clerk")
async def clerk_webhook_handler(request: Request, db: Session = Depends(get_db)):
    """Receives Clerk webhooks and upserts users in database."""
    headers = request.headers
    svix_id = headers.get("svix-id")
    svix_timestamp = headers.get("svix-timestamp")
    svix_signature = headers.get("svix-signature")

    if not svix_id or not svix_timestamp or not svix_signature:
        logger.error("Clerk Webhook: Missing Svix headers")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required Svix headers",
        )

    body = await request.body()
    if not body:
        logger.error("Clerk Webhook: Empty request body")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty request body",
        )

    # Verify signature if WEBHOOK_SECRET is set
    webhook_secret = settings.effective_webhook_secret
    if not webhook_secret or webhook_secret == "whsec_sample_secret_key_for_clerk":
        if not settings.is_dev_mode:
            logger.error("Clerk Webhook rejected: WEBHOOK_SECRET is not configured in production environment.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="WEBHOOK_SECRET is required in production environment to verify webhook signatures.",
            )
        logger.warning("DEBUG MODE ACTIVE: Skipping Svix webhook signature verification.")
    else:
        if not Webhook:
            logger.error("Svix library is not installed")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Webhook verification library missing",
            )
        try:
            # Convert request.headers to dict mapping for Svix compatibility
            headers_dict = dict(headers)
            wh = Webhook(webhook_secret)
            wh.verify(body, headers_dict)
        except WebhookVerificationError as e:
            logger.error(f"Clerk Webhook Verification Failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Webhook signature",
            )
        except Exception as e:
            logger.error(f"Clerk Webhook Verification Error: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Webhook verification failed",
            )

    # Parse JSON body into payload dict
    import json
    try:
        payload = json.loads(body.decode("utf-8"))
    except Exception as e:
        logger.error(f"Clerk Webhook JSON decode error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload",
        )

    if not isinstance(payload, dict) or not payload:
        logger.error(f"Clerk Webhook payload is not a non-empty dict: {payload}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or empty webhook payload",
        )

    event_type = payload.get("type")
    event_data = payload.get("data")
    if not isinstance(event_data, dict):
        event_data = {}

    logger.info(f"Clerk Webhook Received: Event '{event_type}' for ID '{event_data.get('id')}'")

    if event_type in ("user.created", "user.updated"):
        if not event_data.get("id"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing user ID in webhook data",
            )
        user = upsert_user_from_clerk(db, event_data)
        return {
            "status": "success",
            "message": f"User '{user.id}' ({user.email}) promptly upserted.",
        }

    elif event_type == "user.deleted":
        clerk_id = event_data.get("id")
        if clerk_id:
            delete_user_from_clerk(db, clerk_id)
            return {"status": "success", "message": f"User '{clerk_id}' deleted."}

    return {"status": "ignored", "event_type": event_type}
