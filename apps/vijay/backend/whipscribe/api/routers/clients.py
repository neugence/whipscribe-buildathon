"""
Clients & Projects Memory API Router.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from whipscribe.db import get_db, crud
from whipscribe.api.auth import get_current_user_id
from whipscribe.api.schemas import ClientCreateSchema, ProjectCreateSchema

router = APIRouter(tags=["clients"])


@router.get("/api/clients")
def list_clients(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Lists all clients belonging strictly to current authenticated user."""
    clients = crud.list_user_clients(db, user_id=user_id)
    return [
        {
            "id": c.id,
            "name": c.name,
            "whatsapp_number": c.whatsapp_number,
            "notes": c.notes,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "project_count": len(c.projects) if c.projects else 0,
        }
        for c in clients
    ]


@router.post("/api/clients")
def create_client_endpoint(
    payload: ClientCreateSchema,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Creates a new client for current authenticated user."""
    if not payload.name or not payload.name.strip():
        raise HTTPException(status_code=400, detail="Client name is required")
    client = crud.create_client(
        db=db,
        user_id=user_id,
        name=payload.name.strip(),
        whatsapp_number=payload.whatsapp_number,
        notes=payload.notes,
    )
    return {"status": "success", "client": {"id": client.id, "name": client.name}}


@router.get("/api/clients/{client_id}/projects")
def list_projects_endpoint(
    client_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Lists projects under a client belonging strictly to current authenticated user."""
    projects = crud.list_client_projects(db, client_id=client_id, user_id=user_id)
    return [
        {
            "id": p.id,
            "client_id": p.client_id,
            "title": p.title,
            "status": p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "call_count": len(p.calls) if p.calls else 0,
        }
        for p in projects
    ]


@router.post("/api/clients/{client_id}/projects")
def create_project_endpoint(
    client_id: str,
    payload: ProjectCreateSchema,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Creates a new project for a client belonging to user."""
    if not payload.title or not payload.title.strip():
        raise HTTPException(status_code=400, detail="Project title is required")
    try:
        proj = crud.create_project(
            db=db,
            client_id=client_id,
            user_id=user_id,
            title=payload.title.strip(),
            status=payload.status or "active",
        )
        return {"status": "success", "project": {"id": proj.id, "title": proj.title, "client_id": proj.client_id}}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
