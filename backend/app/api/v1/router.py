"""
Version 1 API router.

Single aggregation point for all `/api/v1/*` routes.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import compliance, copilot, documents, knowledge_graph, maintenance

api_router = APIRouter()


@api_router.get("/ping", tags=["health"])
def ping() -> dict:
    """Lightweight liveness check scoped to the versioned API."""
    return {"status": "ok"}


api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(copilot.router, prefix="/copilot", tags=["copilot"])
api_router.include_router(
    knowledge_graph.router, prefix="/knowledge-graph", tags=["knowledge-graph"]
)
api_router.include_router(maintenance.router, prefix="/maintenance", tags=["maintenance"])
api_router.include_router(compliance.router, prefix="/compliance", tags=["compliance"])