"""
Knowledge Graph endpoint.

- GET /knowledge-graph                 build the graph from every document
                                        with extracted text; return nodes + edges
- GET /knowledge-graph?document_id=1   scope the graph to a single document
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.document import Document
from app.services.knowledge_graph import build_graph, graph_to_json

router = APIRouter()


@router.get("")
def get_knowledge_graph(
    document_id: Optional[int] = Query(
        default=None, description="Scope the graph to one document"
    ),
    db: Session = Depends(get_db),
) -> dict:
    stmt = select(Document).where(Document.extracted_text.is_not(None))
    if document_id is not None:
        stmt = stmt.where(Document.id == document_id)

    documents = db.execute(stmt).scalars().all()

    doc_dicts = [
        {"id": d.id, "filename": d.original_filename, "text": d.extracted_text or ""}
        for d in documents
    ]

    graph = build_graph(doc_dicts)
    return graph_to_json(graph)