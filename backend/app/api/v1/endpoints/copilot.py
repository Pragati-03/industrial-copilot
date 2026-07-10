"""
AI Copilot endpoint.

- POST /copilot/ask   ask a question, get an answer grounded in
                      uploaded documents, with source citations
"""

from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.copilot import CopilotError
from app.services.copilot import ask as copilot_ask

router = APIRouter()


class AskRequest(BaseModel):
    question: str = Field(..., min_length=1)
    document_ids: Optional[List[int]] = None
    top_k: int = Field(default=5, ge=1, le=20)


class SourceOut(BaseModel):
    document_id: int
    filename: str
    chunk_index: int
    snippet: str
    score: float


class AskResponse(BaseModel):
    answer: str
    sources: List[SourceOut]


@router.post("/ask", response_model=AskResponse)
def ask_copilot(payload: AskRequest) -> AskResponse:
    try:
        result = copilot_ask(
            question=payload.question,
            document_ids=payload.document_ids,
            top_k=payload.top_k,
        )
    except CopilotError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return AskResponse(
        answer=result.answer,
        sources=[
            SourceOut(
                document_id=s.document_id,
                filename=s.filename,
                chunk_index=s.chunk_index,
                snippet=s.snippet,
                score=s.score,
            )
            for s in result.sources
        ],
    )