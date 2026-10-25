"""
Settings API Router.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from whipscribe.db import get_db, crud
from whipscribe.api.auth import get_current_user_id
from whipscribe.api.schemas import SettingsUpdateSchema

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("")
def get_user_settings(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Fetches user settings (hourly rate, currency, message tone)."""
    settings = crud.get_or_create_settings(db, user_id=user_id)
    return {
        "user_id": settings.user_id,
        "hourly_rate": settings.hourly_rate,
        "currency": settings.currency,
        "message_tone": settings.message_tone,
    }


@router.patch("")
def update_user_settings(
    payload: SettingsUpdateSchema,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Updates user rate and message preferences."""
    settings = crud.get_or_create_settings(db, user_id=user_id)
    if payload.hourly_rate is not None:
        settings.hourly_rate = payload.hourly_rate
    if payload.currency is not None:
        settings.currency = payload.currency
    if payload.message_tone is not None:
        settings.message_tone = payload.message_tone

    db.commit()
    db.refresh(settings)
    return {
        "status": "success",
        "settings": {
            "hourly_rate": settings.hourly_rate,
            "currency": settings.currency,
            "message_tone": settings.message_tone,
        },
    }
