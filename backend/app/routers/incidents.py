from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..config import settings
from ..db import get_db
from ..models import Severity, Status
from ..repositories import incidents as repo
from ..schemas import IncidentCreate, IncidentListResponse, IncidentOut, IncidentUpdate


router = APIRouter()


@router.post("", response_model=IncidentOut, status_code=201)
def create_incident(
    payload: IncidentCreate,
    db: Session = Depends(get_db),
) -> IncidentOut:
    incident = repo.create_incident(db, payload)
    return IncidentOut.model_validate(incident)


@router.get("", response_model=IncidentListResponse)
def list_incidents(
    limit: int = Query(default=settings.DEFAULT_LIMIT, ge=1),
    cursor: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    severity: Optional[Severity] = Query(default=None),
    status: Optional[Status] = Query(default=None),
    service: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
) -> IncidentListResponse:
    items, next_cursor, has_more = repo.list_incidents(
        db,
        limit=limit,
        cursor=cursor,
        search=search,
        severity=severity,
        status=status,
        service=service,
    )
    out_items = [IncidentOut.model_validate(item) for item in items]
    return IncidentListResponse(items=out_items, nextCursor=next_cursor, hasMore=has_more)


@router.get("/{incident_id}", response_model=IncidentOut)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
) -> IncidentOut:
    incident = repo.get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return IncidentOut.model_validate(incident)


@router.patch("/{incident_id}", response_model=IncidentOut)
def update_incident(
    incident_id: int,
    payload: IncidentUpdate,
    db: Session = Depends(get_db),
) -> IncidentOut:
    incident = repo.update_incident(db, incident_id, payload)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return IncidentOut.model_validate(incident)

