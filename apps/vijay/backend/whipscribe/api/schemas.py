"""
Pydantic API Schemas for CallBrief Backend.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class SettingsUpdateSchema(BaseModel):
    hourly_rate: Optional[float] = None
    currency: Optional[str] = None
    message_tone: Optional[str] = None


class ItemUpdateSchema(BaseModel):
    text: Optional[str] = None
    status: Optional[str] = None  # 'proposed' | 'edited' | 'approved' | 'deleted'


class ClientCreateSchema(BaseModel):
    name: str
    whatsapp_number: Optional[str] = None
    notes: Optional[str] = None


class ProjectCreateSchema(BaseModel):
    title: str
    status: Optional[str] = "active"


class ProcessAgentRequestSchema(BaseModel):
    submission_id: str
    override_intent: Optional[str] = None
    client_id: Optional[str] = None
    project_id: Optional[str] = None
    budget: Optional[float] = None


class ConfirmationCreateSchema(BaseModel):
    proposed_scope_message: str


class ConfirmationUpdateSchema(BaseModel):
    status: str  # 'draft' | 'sent' | 'approved' | 'disputed'
    client_reply_text: Optional[str] = None
