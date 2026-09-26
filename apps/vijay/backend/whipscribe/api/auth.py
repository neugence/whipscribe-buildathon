"""
User Authentication & Scoping Dependencies for CallBrief Backend.
"""

import os
import logging
from typing import Optional
from fastapi import Header, Depends, HTTPException, status
from sqlalchemy.orm import Session

from whipscribe.db import get_db, crud, models

logger = logging.getLogger("callbrief-auth")


def verify_clerk_token(token: str) -> Optional[str]:
    """Parses and verifies Clerk JWT token, returning subject (User ID)."""
    import time
    try:
        rsa_public_key = os.getenv("CLERK_PEM_PUBLIC_KEY") or os.getenv("CLERK_RSA_PUBLIC_KEY")
        secret_key = os.getenv("CLERK_SECRET_KEY")
        is_debug_mode = (
            os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")
            or os.getenv("ALLOW_UNAUTHENTICATED_DEV", "false").lower() in ("true", "1", "yes")
        )

        import jwt
        payload = None

        if rsa_public_key and rsa_public_key.startswith("-----BEGIN"):
            try:
                payload = jwt.decode(token, rsa_public_key, algorithms=["RS256"], options={"verify_exp": True})
            except Exception as e:
                logger.warning(f"Clerk JWT signature verification failed with RSA key: {e}")
                return None
        elif secret_key:
            try:
                payload = jwt.decode(token, secret_key, algorithms=["HS256", "RS256"], options={"verify_exp": True})
            except Exception as e:
                logger.warning(f"Clerk JWT signature verification failed with Secret key: {e}")
                return None
        elif is_debug_mode:
            # In dev/debug mode only, allow decoding unverified token if no verification key is configured
            payload = jwt.decode(token, options={"verify_signature": False})
        else:
            # In production, require signature verification key
            logger.warning("Clerk JWT signature verification failed: No CLERK_PEM_PUBLIC_KEY or CLERK_SECRET_KEY configured in production.")
            return None

        if not isinstance(payload, dict):
            return None

        # Check Token Expiration (exp)
        exp = payload.get("exp")
        if exp and isinstance(exp, (int, float)) and time.time() > exp:
            logger.warning("Clerk JWT token has expired.")
            return None

        # Extract Clerk User ID (sub)
        user_id = payload.get("sub")
        if not user_id or not isinstance(user_id, str):
            return None

        return user_id
    except Exception as e:
        logger.warning(f"Clerk JWT decode error: {e}")
        return None


def get_current_user_id(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
) -> str:
    """Enforces server-side user authentication and returns current Clerk User ID.

    Filters all database access strictly to current authenticated user.
    """
    user_id = None

    # 1. Verify Authorization Bearer token header
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
        user_id = verify_clerk_token(token)

    # 2. Development Mode Fallback (gated behind DEBUG / ALLOW_UNAUTHENTICATED_DEV env vars)
    is_debug_mode = (
        os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")
        or os.getenv("ALLOW_UNAUTHENTICATED_DEV", "false").lower() in ("true", "1", "yes")
    )

    if not user_id and x_user_id:
        if is_debug_mode:
            logger.warning(f"DEBUG MODE ACTIVE: Trusting unverified X-User-Id header '{x_user_id}'")
            user_id = x_user_id
        else:
            logger.warning("Unverified X-User-Id header rejected in production mode.")

    if not user_id:
        if is_debug_mode:
            logger.warning("DEBUG MODE ACTIVE: Using default local freelancer user ID.")
            user_id = "user_default_local_freelancer"
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required. Please provide a valid Clerk Bearer token in the Authorization header.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # Ensure user exists in database
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        user = crud.upsert_user_from_clerk(
            db,
            {
                "id": user_id,
                "email_addresses": [{"id": "e1", "email_address": f"{user_id}@callbrief.dev"}],
                "first_name": "Freelancer",
                "last_name": "User",
            },
        )

    return user.id
