"""
Call Details & Items API Router.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from whipscribe.db import get_db, crud, models
from whipscribe.api.auth import get_current_user_id
from whipscribe.api.schemas import ItemUpdateSchema

router = APIRouter(tags=["calls"])


@router.get("/api/calls/{call_id}")
def get_call_details(
    call_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Retrieves detailed call brief and items strictly scoped to authenticated user."""
    call = (
        db.query(models.Call)
        .join(models.UserSubmission, models.Call.user_submission_id == models.UserSubmission.id)
        .filter(models.Call.id == call_id, models.UserSubmission.user_id == user_id)
        .first()
    )
    if not call:
        raise HTTPException(status_code=404, detail="Call not found or unauthorized")

    items = db.query(models.Item).filter(models.Item.call_id == call.id).all()

    return {
        "id": call.id,
        "detected_intent": call.detected_intent,
        "confidence": call.confidence,
        "transcript_text": call.transcript_text,
        "transcript_data": call.transcript_data,
        "items": [
            {
                "id": it.id,
                "type": it.type,
                "text": it.text,
                "original_agent_text": it.original_agent_text,
                "timestamp_link": it.timestamp_link,
                "effort": it.effort,
                "status": it.status,
            }
            for it in items
        ],
    }


@router.patch("/api/items/{item_id}")
def update_proposal_item(
    item_id: str,
    payload: ItemUpdateSchema,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Edits item text or updates status strictly scoped to authenticated user."""
    item = (
        db.query(models.Item)
        .join(models.Call, models.Item.call_id == models.Call.id)
        .join(models.UserSubmission, models.Call.user_submission_id == models.UserSubmission.id)
        .filter(models.Item.id == item_id, models.UserSubmission.user_id == user_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found or unauthorized")

    if payload.text is not None:
        item.text = payload.text
        item.status = "edited"
    if payload.status is not None:
        item.status = payload.status

    db.commit()
    db.refresh(item)

    return {
        "status": "success",
        "item": {
            "id": item.id,
            "type": item.type,
            "text": item.text,
            "original_agent_text": item.original_agent_text,
            "status": item.status,
        },
    }
