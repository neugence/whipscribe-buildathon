"""
User Authentication & Scoping Dependencies for CallBrief Backend.
"""

import logging
from typing import Optional
from fastapi import Header, Depends, HTTPException, status
from sqlalchemy.orm import Session

from whipscribe.db import get_db, crud, models
from whipscribe.settings import settings

logger = logging.getLogger("callbrief-auth")


# ---------------------------------------------------------------------------
# JWKS client — lazily initialised and cached for the lifetime of the process.
# Clerk signs JWTs with RS256; the JWKS endpoint exposes the matching public
# key.  CLERK_SECRET_KEY is a *backend API key*, not a JWT signing secret.
# ---------------------------------------------------------------------------
_jwks_client = None  # jwt.PyJWKClient instance, or None if not configured


def _get_jwks_client():
    """Returns a cached PyJWKClient pointed at Clerk's JWKS endpoint."""
    global _jwks_client
    if _jwks_client is not None:
        return _jwks_client

    jwks_url = settings.clerk_jwks_url
    if not jwks_url:
        return None

    try:
        from jwt import PyJWKClient  # PyJWT >= 2.x
        _jwks_client = PyJWKClient(jwks_url, cache_keys=True)
        logger.info(f"Clerk JWKS client initialised: {jwks_url}")
        return _jwks_client
    except Exception as e:
        logger.warning(f"Failed to initialise Clerk JWKS client: {e}")
        return None


def verify_clerk_token(token: str) -> Optional[str]:
    """Verifies a Clerk session JWT and returns the Clerk user ID (sub claim).

    Verification order:
      1. JWKS endpoint  (RS256, auto-fetches public key — preferred)
      2. PEM public key (RS256, if CLERK_PEM_PUBLIC_KEY is set)
      3. Dev-mode unverified decode (only when DEBUG=true)
    """
    import jwt

    payload: Optional[dict] = None

    # -- Method 1: JWKS (Clerk RS256) ----------------------------------------
    jwks_client = _get_jwks_client()
    if jwks_client:
        try:
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                options={"verify_exp": True},
                leeway=30,  # tolerate up to 30s clock skew between client & Clerk
            )
        except Exception as e:
            logger.warning(f"Clerk JWKS verification failed: {e}")
            return None

    # -- Method 2: explicit RSA PEM public key --------------------------------
    elif settings.clerk_pem_public_key or settings.clerk_rsa_public_key:
        rsa_key = settings.clerk_pem_public_key or settings.clerk_rsa_public_key
        try:
            payload = jwt.decode(
                token, rsa_key, algorithms=["RS256"], options={"verify_exp": True}
            )
        except Exception as e:
            logger.warning(f"Clerk PEM verification failed: {e}")
            return None

    # -- Method 3: dev-mode unverified decode ---------------------------------
    elif settings.is_dev_mode:
        logger.warning(
            "DEBUG MODE: No CLERK_PUBLISHABLE_KEY or CLERK_PEM_PUBLIC_KEY set — "
            "decoding JWT without signature verification."
        )
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
        except Exception as e:
            logger.warning(f"Dev-mode JWT decode failed: {e}")
            return None

    else:
        logger.warning(
            "Clerk JWT verification failed: set CLERK_PUBLISHABLE_KEY in backend/.env "
            "to enable automatic JWKS-based RS256 verification."
        )
        return None

    if not isinstance(payload, dict):
        return None

    user_id = payload.get("sub")
    if not user_id or not isinstance(user_id, str):
        logger.warning("Clerk JWT has no valid 'sub' claim.")
        return None

    return user_id


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

    # 2. Development Mode Fallback (gated behind DEBUG / ALLOW_UNAUTHENTICATED_DEV settings)
    if not user_id and x_user_id:
        if settings.is_dev_mode:
            logger.warning(f"DEBUG MODE ACTIVE: Trusting unverified X-User-Id header '{x_user_id}'")
            user_id = x_user_id
        else:
            logger.warning("Unverified X-User-Id header rejected in production mode.")

    if not user_id:
        if settings.is_dev_mode:
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
