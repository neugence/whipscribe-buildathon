"""
Application settings loaded via pydantic-settings.

Pydantic-settings reads values in this priority order:
  1. Environment variables (already set in the shell)
  2. .env file   — auto-discovered at ``backend/.env``
  3. Field defaults

The settings object is a module-level singleton (``settings``).
Import it wherever you need config:

    from whipscribe.settings import settings

    print(settings.clerk_secret_key)
    print(settings.database_url)
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


# Resolve the .env file relative to this file (backend/.env)
_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    """
    Centralised application configuration.

    Every field maps 1-to-1 to an environment variable of the same name
    (case-insensitive). Values are loaded from:
      1. Real env vars set in the shell / hosting platform
      2. ``backend/.env`` (auto-loaded by pydantic-settings)
      3. The field default below
    """

    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",   # silently ignore extra keys in .env
    )

    # ------------------------------------------------------------------ #
    # WhipScribe API                                                       #
    # ------------------------------------------------------------------ #
    whipscribe_api: str = ""
    """WhipScribe API key (``tk_...``). Required for transcription."""

    api_base_url: str = "https://whipscribe.com/api/v1"
    """Override the WhipScribe API base URL (useful for local testing)."""

    api_timeout: int = 120
    """Default per-request HTTP timeout in seconds."""

    api_max_retries: int = 3
    """Maximum retry attempts for 429 / 502 responses."""

    api_backoff_base: float = 1.5
    """Base wait time (seconds) for exponential back-off between retries."""

    jobs_poll_interval: float = 3.0
    """Seconds between status polls in ``jobs.wait_for_done()``."""

    jobs_poll_timeout: float = 600.0
    """Maximum seconds ``jobs.wait_for_done()`` will wait before raising."""

    clips_poll_interval: float = 5.0
    """Seconds between status polls in ``clips.wait_for_done()``."""

    clips_poll_timeout: float = 300.0
    """Maximum seconds ``clips.wait_for_done()`` will wait before raising."""

    # ------------------------------------------------------------------ #
    # Database                                                             #
    # ------------------------------------------------------------------ #
    database_url: Optional[str] = None
    """Primary database URL. Falls back to postgres_url, then SQLite."""

    postgres_url: Optional[str] = None
    """Alias accepted by some hosting platforms (e.g. Vercel Postgres)."""

    vercel: Optional[str] = None
    """Set by Vercel platform; used to select the /tmp SQLite fallback."""

    vercel_env: Optional[str] = None
    """Set by Vercel platform (preview / production)."""

    # ------------------------------------------------------------------ #
    # Clerk authentication                                                  #
    # ------------------------------------------------------------------ #
    clerk_secret_key: Optional[str] = None
    """Clerk backend API key (``sk_test_...``). Used for Clerk SDK calls,
    NOT for direct JWT verification (Clerk signs JWTs with RS256, not HMAC)."""

    clerk_pem_public_key: Optional[str] = None
    """RSA PEM public key for RS256 Clerk JWT verification (optional)."""

    clerk_rsa_public_key: Optional[str] = None
    """Alternate env-var name for the RSA PEM key."""

    clerk_publishable_key: Optional[str] = None
    """Clerk publishable key (``pk_test_...`` / ``pk_live_...``).
    Used to auto-derive the JWKS endpoint for JWT verification.
    Copy from ``NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`` in the frontend .env."""

    next_public_clerk_publishable_key: Optional[str] = None
    """Alternate field name — pydantic-settings picks up the NEXT_PUBLIC_ prefix variant too."""

    # ------------------------------------------------------------------ #
    # Clerk webhooks                                                        #
    # ------------------------------------------------------------------ #
    webhook_secret: Optional[str] = None
    """Svix signing secret for Clerk webhooks (``whsec_...``)."""

    clerk_webhook_secret: Optional[str] = None
    """Alternate env-var name for the Svix webhook secret."""

    # ------------------------------------------------------------------ #
    # Dev / debug flags                                                     #
    # ------------------------------------------------------------------ #
    debug: bool = False
    """Enable debug mode (relaxed auth, fallback behaviour)."""

    allow_unauthenticated_dev: bool = False
    """When True, allow unauthenticated requests in dev without a token."""

    # ------------------------------------------------------------------ #
    # Backend public URL                                                    #
    # ------------------------------------------------------------------ #
    backend_public_url: str = "http://localhost:8000"
    """Publicly reachable URL of this backend (used for audio fallback URLs)."""

    # ------------------------------------------------------------------ #
    # Vertex AI / Google GenAI                                              #
    # ------------------------------------------------------------------ #
    vertex_project: Optional[str] = None
    """GCP project ID for Vertex AI."""

    gcp_project: Optional[str] = None
    """Alternate env-var name for GCP project."""

    google_cloud_project: Optional[str] = None
    """Standard GCP env var; also discovered by google.auth.default()."""

    vertex_location: Optional[str] = None
    """Vertex AI region, e.g. ``us-central1``."""

    gcp_location: Optional[str] = None
    """Alternate env-var name for Vertex AI region."""

    gemini_api_key: Optional[str] = None
    """Gemini API key (direct API key mode, no Vertex AI required)."""

    gemini_key: Optional[str] = None
    """Alternate env-var name used in some .env files."""

    google_api_key: Optional[str] = None
    """Standard Google API key env var."""

    vertex_model: Optional[str] = None
    """Default Gemini model name, e.g. ``gemini-2.5-flash``."""

    groq_api_key: Optional[str] = None
    """Groq API key."""

    groq_model: Optional[str] = None
    """Default Groq model name, e.g. ``qwen/qwen3.8-27b``."""

    # ------------------------------------------------------------------ #
    # Convenience properties                                                #
    # ------------------------------------------------------------------ #
    @property
    def effective_database_url(self) -> str:
        """Returns the first available database URL, falling back to SQLite."""
        url = self.database_url or self.postgres_url
        if not url:
            if self.vercel or self.vercel_env:
                return "sqlite:////tmp/callbrief.db"
            return "sqlite:///./callbrief.db"
        # Normalise postgres:// → postgresql+psycopg2://
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
            url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return url

    @property
    def is_dev_mode(self) -> bool:
        """True when running in debug / unauthenticated-dev mode."""
        return self.debug or self.allow_unauthenticated_dev

    @property
    def effective_webhook_secret(self) -> Optional[str]:
        """Returns the first available webhook secret."""
        return self.webhook_secret or self.clerk_webhook_secret

    @property
    def effective_gemini_api_key(self) -> Optional[str]:
        """Returns the first available Gemini / Google API key."""
        return self.gemini_api_key or self.gemini_key or self.google_api_key

    @property
    def effective_groq_api_key(self) -> Optional[str]:
        """Returns the configured Groq API key."""
        return self.groq_api_key

    @property
    def effective_groq_model(self) -> str:
        """Returns the configured Groq model name."""
        return self.groq_model or "qwen/qwen3.8-27b"

    @property
    def effective_vertex_project(self) -> Optional[str]:
        """Returns the first available GCP project ID."""
        return self.vertex_project or self.gcp_project or self.google_cloud_project

    @property
    def effective_vertex_location(self) -> str:
        """Returns the Vertex AI region, defaulting to us-central1."""
        return self.vertex_location or self.gcp_location or "us-central1"

    @property
    def effective_vertex_model(self) -> str:
        """Returns the configured Gemini model name."""
        return self.vertex_model or "gemini-2.5-flash"

    @property
    def clerk_jwks_url(self) -> Optional[str]:
        """Derives the Clerk JWKS endpoint URL from the publishable key.

        Clerk signs session JWTs with RS256.  The JWKS endpoint exposes the
        matching public key so PyJWT can verify signatures without needing any
        secret.  The URL is derived automatically from the publishable key:

            pk_test_cG9saXNoZWQtYnVjay04MjUzLmNsZXJrLmFjY291bnRzLmRldiQ
            → base64-decode the suffix → polished-buck-8253.clerk.accounts.dev
            → https://polished-buck-8253.clerk.accounts.dev/.well-known/jwks.json
        """
        import base64
        pk = self.clerk_publishable_key or self.next_public_clerk_publishable_key
        if not pk:
            return None
        try:
            # Strip pk_test_ / pk_live_ prefix, then base64-decode the rest
            b64 = "_".join(pk.split("_")[2:])   # everything after 'pk_test_' or 'pk_live_'
            # Add padding so Python doesn't choke
            b64_padded = b64 + "=" * (-len(b64) % 4)
            domain = base64.b64decode(b64_padded).decode().rstrip("$")
            return f"https://{domain}/.well-known/jwks.json"
        except Exception:
            return None


# Module-level singleton — import this everywhere
settings = Settings()  # type: ignore[call-arg]
