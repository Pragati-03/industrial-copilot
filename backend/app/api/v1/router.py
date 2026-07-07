from fastapi import APIRouter

from app.api.v1.endpoints import documents

api_router = APIRouter()


@api_router.get("/ping", tags=["health"])
def ping() -> dict:
    return {"status": "ok"}


api_router.include_router(documents.router, prefix="/documents", tags=["documents"])