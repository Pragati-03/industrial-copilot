"""
Maintenance Intelligence endpoint.

- GET /maintenance/insights   detect recurring failures across all
                               documents and return AI-grounded root
                               cause, preventive recommendation,
                               severity, and next inspection date per
                               affected equipment/machine
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.document import Document
from app.services.maintenance_intelligence import get_maintenance_insights

router = APIRouter()


class MaintenanceInsightOut(BaseModel):
    equipment_id: str
    equipment_label: str
    equipment_type: str
    is_recurring: bool
    failure_count: int
    distinct_failure_types: List[str]
    failures: List[dict]
    events: List[dict]
    engineers: List[str]
    documents: List[dict]
    last_event_date: Optional[str] = None
    root_cause: str
    preventive_recommendation: str
    severity: str
    severity_reason: str
    next_inspection_date: Optional[str] = None
    confidence: str
    ai_generated: bool


@router.get("/insights", response_model=List[MaintenanceInsightOut])
def list_maintenance_insights(
    only_recurring: bool = Query(default=False, description="Only return equipment with 2+ failures"),
    db: Session = Depends(get_db),
) -> List[MaintenanceInsightOut]:
    stmt = select(Document).where(Document.extracted_text.is_not(None))
    documents = db.execute(stmt).scalars().all()

    doc_dicts = [
        {"id": d.id, "filename": d.original_filename, "text": d.extracted_text or ""}
        for d in documents
    ]

    insights = get_maintenance_insights(doc_dicts, only_recurring=only_recurring)

    return [
        MaintenanceInsightOut(
            equipment_id=i.equipment_id,
            equipment_label=i.equipment_label,
            equipment_type=i.equipment_type,
            is_recurring=i.is_recurring,
            failure_count=i.failure_count,
            distinct_failure_types=i.distinct_failure_types,
            failures=i.failures,
            events=i.events,
            engineers=i.engineers,
            documents=i.documents,
            last_event_date=i.last_event_date,
            root_cause=i.root_cause,
            preventive_recommendation=i.preventive_recommendation,
            severity=i.severity,
            severity_reason=i.severity_reason,
            next_inspection_date=i.next_inspection_date,
            confidence=i.confidence,
            ai_generated=i.ai_generated,
        )
        for i in insights
    ]