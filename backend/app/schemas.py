from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from .models import Severity, Status


class IncidentBase(BaseModel):
    title: str = Field(..., max_length=255)
    service: str = Field(..., max_length=100)
    severity: Severity
    status: Status = Status.OPEN
    owner: Optional[str] = Field(default=None, max_length=100)
    summary: Optional[str] = None


class IncidentCreate(IncidentBase):
    pass


class IncidentUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=255)
    service: Optional[str] = Field(default=None, max_length=100)
    severity: Optional[Severity] = None
    status: Optional[Status] = None
    owner: Optional[str] = Field(default=None, max_length=100)
    summary: Optional[str] = None


class IncidentOut(BaseModel):
    id: int
    title: str
    service: str
    severity: Severity
    status: Status
    owner: Optional[str]
    summary: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class IncidentListResponse(BaseModel):
    items: List[IncidentOut]
    nextCursor: Optional[str]
    hasMore: bool

