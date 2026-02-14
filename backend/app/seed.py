import random
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from .db import db_session
from .models import Incident, Severity, Status


SERVICES = ["auth", "billing", "data-pipeline", "api-gateway", "notifications"]
OWNERS = ["alice", "bob", "carol", "dave", "eve", None]


def _random_datetime_within_days(days: int = 120) -> datetime:
    now = datetime.now(timezone.utc)
    delta = timedelta(days=random.randint(0, days), hours=random.randint(0, 23), minutes=random.randint(0, 59))
    return now - delta


def seed_incidents(db: Session, count: int = 200) -> None:
    incidents: list[Incident] = []
    for i in range(count):
        created_at = _random_datetime_within_days()
        updated_at = created_at + timedelta(hours=random.randint(0, 72))
        severity = random.choice(list(Severity))
        status = random.choice(list(Status))
        service = random.choice(SERVICES)
        owner = random.choice(OWNERS)

        incident = Incident(
            title=f"{severity.value} incident in {service} #{i+1}",
            service=service,
            severity=severity,
            status=status,
            owner=owner,
            summary=f"Auto-generated incident {i+1} for service {service}.",
            created_at=created_at,
            updated_at=updated_at,
        )
        incidents.append(incident)

    db.bulk_save_objects(incidents)


def main() -> None:
    with db_session() as db:
        seed_incidents(db)


if __name__ == "__main__":
    main()

