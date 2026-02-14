from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import incidents
from .db import engine, SessionLocal
from .models import Base, Incident
from .seed import seed_incidents


def create_app() -> FastAPI:
    app = FastAPI(title="Incident Tracker API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_ORIGIN],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(
        incidents.router,
        prefix="/api/incidents",
        tags=["incidents"],
    )

    app.add_event_handler("startup", startup_handler)

    @app.get("/health", tags=["health"])
    def health_check():
        return {"status": "ok"}

    return app


def startup_handler() -> None:
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if db.query(Incident).count() == 0:
            seed_incidents(db)
            db.commit()
    finally:
        db.close()


app = create_app()
