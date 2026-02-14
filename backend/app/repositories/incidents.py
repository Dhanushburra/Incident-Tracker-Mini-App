import base64
import json
from datetime import datetime
from typing import List, Optional, Tuple

from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from ..config import settings
from ..models import Incident, Severity, Status
from ..schemas import IncidentCreate, IncidentUpdate

CursorTuple = Tuple[datetime, int]


def _encode_cursor(cursor: CursorTuple) -> str:
    created_at, incident_id = cursor
    payload = {
        "createdAt": created_at.isoformat(),
        "id": incident_id,
    }
    raw = json.dumps(payload).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("ascii")


def _decode_cursor(cursor: str) -> CursorTuple:
    raw = base64.urlsafe_b64decode(cursor.encode("ascii"))
    payload = json.loads(raw.decode("utf-8"))
    created_at = datetime.fromisoformat(payload["createdAt"])
    incident_id = int(payload["id"])
    return created_at, incident_id


def create_incident(db: Session, data: IncidentCreate) -> Incident:
    incident = Incident(
        title=data.title,
        service=data.service,
        severity=data.severity,
        status=data.status,
        owner=data.owner,
        summary=data.summary,
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


def get_incident(db: Session, incident_id: int) -> Optional[Incident]:
    return db.get(Incident, incident_id)


def update_incident(db: Session, incident_id: int, data: IncidentUpdate) -> Optional[Incident]:
    incident = db.get(Incident, incident_id)
    if not incident:
        return None

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(incident, field, value)

    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


def list_incidents(
    db: Session,
    *,
    limit: int,
    cursor: Optional[str],
    search: Optional[str],
    severity: Optional[Severity],
    status: Optional[Status],
    service: Optional[str],
) -> Tuple[List[Incident], Optional[str], bool]:
    """Return incidents using cursor-based pagination and filters."""
    # Clamp limit to configured bounds
    if limit <= 0:
        limit = settings.DEFAULT_LIMIT
    limit = min(limit, settings.MAX_LIMIT)

    stmt = select(Incident)

    # Filters
    if severity:
        stmt = stmt.where(Incident.severity == severity)
    if status:
        stmt = stmt.where(Incident.status == status)
    if service:
        stmt = stmt.where(Incident.service == service)
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                Incident.title.ilike(pattern),
                Incident.summary.ilike(pattern),
                Incident.service.ilike(pattern),
            )
        )

    # Cursor
    if cursor:
        cursor_created_at, cursor_id = _decode_cursor(cursor)
        stmt = stmt.where(
            or_(
                Incident.created_at < cursor_created_at,
                and_(Incident.created_at == cursor_created_at, Incident.id < cursor_id),
            )
        )

    # Ordering and limit(+1 to detect hasMore)
    stmt = stmt.order_by(Incident.created_at.desc(), Incident.id.desc()).limit(limit + 1)

    results = list(db.execute(stmt).scalars())

    has_more = False
    next_cursor: Optional[str] = None

    if len(results) > limit:
        has_more = True
        last = results[limit - 1]
        next_cursor = _encode_cursor((last.created_at, last.id))
        results = results[:limit]

    return results, next_cursor, has_more

