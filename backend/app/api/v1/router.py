"""
Version 1 API router.

This is the single aggregation point for all `/api/v1/*` routes.
Feature routers (documents, knowledge-graph, copilot, maintenance,
compliance, lessons-learned, etc.) will be created in their own modules
under `app/api/v1/` and included here in later phases.
"""

from fastapi import APIRouter

api_router = APIRouter()


@api_router.get("/ping", tags=["health"])
def ping() -> dict:
    """Lightweight liveness check scoped to the versioned API."""
    return {"status": "ok"}


# Future routers will be included like so:
# from app.api.v1.endpoints import documents
# api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
