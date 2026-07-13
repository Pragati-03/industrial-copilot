"""
Compliance Intelligence endpoint.

- GET /compliance/report            JSON compliance report
- GET /compliance/report/download   the same report as a downloadable PDF
"""

from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.document import Document
from app.services.compliance import generate_compliance_report
from app.services.compliance_pdf import build_compliance_pdf

router = APIRouter()


class ComplianceMatchOut(BaseModel):
    document_id: int
    filename: str
    snippet: str


class ComplianceItemOut(BaseModel):
    rule_id: str
    category: str
    title: str
    description: str
    risk_level: str
    compliant: bool
    matches: List[ComplianceMatchOut]


class ComplianceReportOut(BaseModel):
    generated_at: str
    documents_analyzed: List[dict]
    compliance_score: float
    overall_risk_level: str
    compliant_items: List[ComplianceItemOut]
    missing_items: List[ComplianceItemOut]
    summary: str
    ai_generated_summary: bool


def _load_documents(db: Session) -> List[dict]:
    stmt = select(Document).where(Document.extracted_text.is_not(None))
    documents = db.execute(stmt).scalars().all()
    return [
        {"id": d.id, "filename": d.original_filename, "text": d.extracted_text or ""}
        for d in documents
    ]


def _to_item_out(item) -> ComplianceItemOut:
    return ComplianceItemOut(
        rule_id=item.rule_id,
        category=item.category,
        title=item.title,
        description=item.description,
        risk_level=item.risk_level,
        compliant=item.compliant,
        matches=[
            ComplianceMatchOut(document_id=m.document_id, filename=m.filename, snippet=m.snippet)
            for m in item.matches
        ],
    )


@router.get("/report", response_model=ComplianceReportOut)
def get_compliance_report(db: Session = Depends(get_db)) -> ComplianceReportOut:
    documents = _load_documents(db)
    report = generate_compliance_report(documents)

    return ComplianceReportOut(
        generated_at=report.generated_at,
        documents_analyzed=report.documents_analyzed,
        compliance_score=report.compliance_score,
        overall_risk_level=report.overall_risk_level,
        compliant_items=[_to_item_out(i) for i in report.compliant_items],
        missing_items=[_to_item_out(i) for i in report.missing_items],
        summary=report.summary,
        ai_generated_summary=report.ai_generated_summary,
    )


@router.get("/report/download")
def download_compliance_report(db: Session = Depends(get_db)) -> Response:
    documents = _load_documents(db)
    report = generate_compliance_report(documents)
    pdf_bytes = build_compliance_pdf(report)

    filename = f"compliance-report-{datetime.now().strftime('%Y%m%d-%H%M%S')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )