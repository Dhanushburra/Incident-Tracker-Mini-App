from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import incidents


def create_app() -> FastAPI:
    app = FastAPI(title="Incident Tracker API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_ORIGIN],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(incidents.router, prefix="/api/incidents", tags=["incidents"])

    @app.get("/health", tags=["health"])
    def health_check():
        return {"status": "ok"}

    return app


app = create_app()

