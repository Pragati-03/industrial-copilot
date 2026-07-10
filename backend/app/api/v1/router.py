"""
Version 1 API router.

Single aggregation point for all `/api/v1/*` routes.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import copilot, documents

api_router = APIRouter()


@api_router.get("/ping", tags=["health"])
def ping() -> dict:
    """Lightweight liveness check scoped to the versioned API."""
    return {"status": "ok"}


api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(copilot.router, prefix="/copilot", tags=["copilot"])