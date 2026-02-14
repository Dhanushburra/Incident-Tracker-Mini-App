import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import declarative_base


Base = declarative_base()


class Severity(str, enum.Enum):
    SEV1 = "SEV1"
    SEV2 = "SEV2"
    SEV3 = "SEV3"
    SEV4 = "SEV4"


class Status(str, enum.Enum):
    OPEN = "OPEN"
    MITIGATED = "MITIGATED"
    RESOLVED = "RESOLVED"


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    service = Column(String(100), nullable=False, index=True)
    severity = Column(Enum(Severity), nullable=False, index=True)
    status = Column(Enum(Status), nullable=False, index=True, default=Status.OPEN)
    owner = Column(String(100), nullable=True)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


Index(
    "ix_incidents_created_at_id_desc",
    Incident.created_at.desc(),
    Incident.id.desc(),
)

