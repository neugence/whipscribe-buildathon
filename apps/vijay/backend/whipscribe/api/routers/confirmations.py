"""
Scope Confirmation Lifecycle API Router.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from whipscribe.db import get_db, crud
from whipscribe.api.auth import get_current_user_id
from whipscribe.api.schemas import ConfirmationCreateSchema, ConfirmationUpdateSchema

router = APIRouter(tags=["confirmations"])


@router.post("/api/calls/{call_id}/confirmation")
def create_confirmation_endpoint(
    call_id: str,
    payload: ConfirmationCreateSchema,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Creates or updates a scope confirmation tracking record for a call."""
    try:
        conf = crud.create_confirmation(
            db=db,
            call_id=call_id,
            user_id=user_id,
            proposed_scope_message=payload.proposed_scope_message,
        )
        return {
            "status": "success",
            "confirmation": {
                "id": conf.id,
                "call_id": conf.call_id,
                "proposed_scope_message": conf.proposed_scope_message,
                "status": conf.status,
            },
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/api/calls/{call_id}/confirmation")
def get_confirmation_endpoint(
    call_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Retrieves scope confirmation record for a call strictly scoped to user."""
    conf = crud.get_confirmation_by_call(db, call_id=call_id, user_id=user_id)
    if not conf:
        raise HTTPException(status_code=404, detail="Confirmation record not found for this call")
    return {
        "id": conf.id,
        "call_id": conf.call_id,
        "proposed_scope_message": conf.proposed_scope_message,
        "client_reply_text": conf.client_reply_text,
        "status": conf.status,
        "created_at": conf.created_at.isoformat() if conf.created_at else None,
    }


@router.patch("/api/confirmations/{confirmation_id}")
def update_confirmation_endpoint(
    confirmation_id: str,
    payload: ConfirmationUpdateSchema,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Updates scope confirmation status ('draft', 'sent', 'approved', 'disputed') and client response text."""
    conf = crud.update_confirmation_status(
        db=db,
        confirmation_id=confirmation_id,
        user_id=user_id,
        status=payload.status,
        client_reply_text=payload.client_reply_text,
    )
    if not conf:
        raise HTTPException(status_code=404, detail="Confirmation record not found or unauthorized")
    return {
        "status": "success",
        "confirmation": {
            "id": conf.id,
            "status": conf.status,
            "client_reply_text": conf.client_reply_text,
        },
    }
