"""
Generates a downloadable PDF version of a ComplianceReport using
reportlab (pure Python, no external binary required).
"""

from __future__ import annotations

import io
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.services.compliance import ComplianceReport

_RISK_COLORS = {
    "Critical": colors.HexColor("#C53030"),
    "High": colors.HexColor("#D98E2B"),
    "Medium": colors.HexColor("#2B6CB0"),
    "Low": colors.HexColor("#2F855A"),
}

_NAVY = colors.HexColor("#0F2A44")
_STEEL = colors.HexColor("#5B7083")


def _styles():
    base = getSampleStyleSheet()
    base.add(ParagraphStyle(name="ReportTitle", parent=base["Title"], textColor=_NAVY, fontSize=20, spaceAfter=4))
    base.add(ParagraphStyle(name="ReportMeta", parent=base["Normal"], textColor=_STEEL, fontSize=9, spaceAfter=14))
    base.add(ParagraphStyle(name="SectionHeading", parent=base["Heading2"], textColor=_NAVY, fontSize=13, spaceBefore=16, spaceAfter=8))
    base.add(ParagraphStyle(name="ItemTitle", parent=base["Normal"], fontSize=10.5, leading=14, textColor=colors.HexColor("#1C2B3A"), alignment=TA_LEFT))
    base.add(ParagraphStyle(name="ItemBody", parent=base["Normal"], fontSize=9, leading=12, textColor=_STEEL))
    return base


def build_compliance_pdf(report: ComplianceReport) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=LETTER,
        topMargin=0.75 * inch, bottomMargin=0.75 * inch,
        leftMargin=0.75 * inch, rightMargin=0.75 * inch,
        title="Compliance Intelligence Report",
    )
    styles = _styles()
    story = []

    generated_dt = datetime.fromisoformat(report.generated_at)
    story.append(Paragraph("Compliance Intelligence Report", styles["ReportTitle"]))
    story.append(Paragraph(
        f"Generated {generated_dt.strftime('%B %d, %Y at %H:%M UTC')} · "
        f"{len(report.documents_analyzed)} document(s) analyzed",
        styles["ReportMeta"],
    ))

    risk_color = _RISK_COLORS.get(report.overall_risk_level, _STEEL)
    summary_table = Table(
        [
            [
                Paragraph(f"<b>{report.compliance_score:.0f}%</b>", styles["ReportTitle"]),
                Paragraph(f'<font color="{risk_color.hexval()}"><b>{report.overall_risk_level}</b></font>', styles["ReportTitle"]),
            ],
            [
                Paragraph("Compliance Score", styles["ItemBody"]),
                Paragraph("Overall Risk Level", styles["ItemBody"]),
            ],
        ],
        colWidths=[3 * inch, 3 * inch],
    )
    summary_table.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#E2E8F0")),
        ("INNERGRID", (0, 0), (-1, -1), 0.75, colors.HexColor("#E2E8F0")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 10))
    story.append(Paragraph(report.summary, styles["ItemBody"]))

    story.append(Paragraph(f"Missing Procedures ({len(report.missing_items)})", styles["SectionHeading"]))
    if not report.missing_items:
        story.append(Paragraph("No gaps found against the checked categories.", styles["ItemBody"]))
    else:
        rows = [["Category", "Risk", "What's expected"]]
        for item in report.missing_items:
            rows.append([
                Paragraph(item.category, styles["ItemTitle"]),
                Paragraph(f'<font color="{_RISK_COLORS.get(item.risk_level, _STEEL).hexval()}"><b>{item.risk_level}</b></font>', styles["ItemBody"]),
                Paragraph(item.description, styles["ItemBody"]),
            ])
        missing_table = Table(rows, colWidths=[1.6 * inch, 0.8 * inch, 3.6 * inch], repeatRows=1)
        missing_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F5F7FA")),
            ("LINEBELOW", (0, 0), (-1, 0), 0.75, colors.HexColor("#CBD5E0")),
            ("LINEBELOW", (0, 1), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(missing_table)

    story.append(Paragraph(f"Compliant Items ({len(report.compliant_items)})", styles["SectionHeading"]))
    if not report.compliant_items:
        story.append(Paragraph("None of the checked categories were found in the uploaded documents.", styles["ItemBody"]))
    else:
        rows = [["Category", "Evidence"]]
        for item in report.compliant_items:
            evidence = "; ".join(f"{m.filename}" for m in item.matches[:3])
            rows.append([
                Paragraph(item.category, styles["ItemTitle"]),
                Paragraph(evidence, styles["ItemBody"]),
            ])
        compliant_table = Table(rows, colWidths=[2.2 * inch, 3.8 * inch], repeatRows=1)
        compliant_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F5F7FA")),
            ("LINEBELOW", (0, 0), (-1, 0), 0.75, colors.HexColor("#CBD5E0")),
            ("LINEBELOW", (0, 1), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(compliant_table)

    doc.build(story)
    return buffer.getvalue()