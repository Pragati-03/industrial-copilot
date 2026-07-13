"""
Compliance Intelligence service.

Compares every uploaded document's extracted text against a predefined
checklist of industrial safety procedure categories. Each rule is
matched by keyword/phrase presence (case-insensitive) across all
documents combined -- if any document mentions terms associated with a
rule, that rule is marked compliant with the matching document(s) as
evidence; otherwise it's flagged missing, at that rule's baseline risk
level.

This is a built-in checklist reflecting common general-industry safety
procedure categories (PPE, lockout/tagout, confined space entry, etc.)
-- not a verbatim reproduction of any specific regulatory text. It is
meant as a practical starting checklist, not a certified compliance
audit.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, List, Optional

from app.services.copilot import CopilotError, get_chat_model

RiskLevel = str

_RISK_ORDER = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}


@dataclass(frozen=True)
class SafetyRule:
    id: str
    category: str
    title: str
    description: str
    keywords: List[str]
    risk_if_missing: RiskLevel


SAFETY_RULES: List[SafetyRule] = [
    SafetyRule(
        id="ppe",
        category="Personal Protective Equipment",
        title="PPE requirements are documented",
        description="SOPs should specify required PPE (safety glasses, hard hats, gloves, hearing/respiratory protection) for the task.",
        keywords=["personal protective equipment", "ppe", "safety glasses", "hard hat", "hearing protection", "respirator"],
        risk_if_missing="High",
    ),
    SafetyRule(
        id="loto",
        category="Lockout / Tagout",
        title="Energy isolation (lockout/tagout) procedure exists",
        description="Procedures for de-energizing and isolating equipment before servicing should be documented.",
        keywords=["lockout", "tagout", "loto", "energy isolation", "de-energiz"],
        risk_if_missing="Critical",
    ),
    SafetyRule(
        id="confined_space",
        category="Confined Space Entry",
        title="Confined space entry procedure exists",
        description="Atmospheric testing and entry-permit procedures should be documented for confined space work.",
        keywords=["confined space", "atmospheric testing", "entry permit"],
        risk_if_missing="Critical",
    ),
    SafetyRule(
        id="hazcom",
        category="Hazard Communication",
        title="Hazard communication / SDS references present",
        description="Chemical hazard labeling and safety data sheet (SDS/MSDS) references should be documented.",
        keywords=["hazard communication", "safety data sheet", "sds", "msds", "chemical labeling"],
        risk_if_missing="High",
    ),
    SafetyRule(
        id="emergency_response",
        category="Emergency Response",
        title="Emergency response procedure exists",
        description="Evacuation routes, emergency shutdown steps, and emergency contacts should be documented.",
        keywords=["emergency response", "evacuation", "emergency shutdown", "emergency contact"],
        risk_if_missing="Critical",
    ),
    SafetyRule(
        id="fire_safety",
        category="Fire Safety",
        title="Fire safety / hot work procedure exists",
        description="Fire extinguisher locations, suppression systems, and hot work permits should be documented.",
        keywords=["fire safety", "fire extinguisher", "fire suppression", "hot work permit"],
        risk_if_missing="High",
    ),
    SafetyRule(
        id="machine_guarding",
        category="Machine Guarding",
        title="Machine guarding requirements documented",
        description="Guards for pinch points and moving parts should be documented for relevant equipment.",
        keywords=["machine guard", "guarding", "pinch point", "moving parts"],
        risk_if_missing="High",
    ),
    SafetyRule(
        id="electrical_safety",
        category="Electrical Safety",
        title="Electrical safety procedure exists",
        description="Arc flash precautions, grounding, and de-energization steps should be documented for electrical work.",
        keywords=["electrical safety", "arc flash", "de-energized", "grounding", "high voltage"],
        risk_if_missing="Critical",
    ),
    SafetyRule(
        id="fall_protection",
        category="Fall Protection",
        title="Fall protection procedure exists",
        description="Harness use, guardrails, and fall-arrest requirements should be documented for work at height.",
        keywords=["fall protection", "harness", "guardrail", "working at height", "fall arrest"],
        risk_if_missing="High",
    ),
    SafetyRule(
        id="hazmat",
        category="Hazardous Materials Handling",
        title="Hazardous materials handling procedure exists",
        description="Spill response and hazardous chemical storage procedures should be documented.",
        keywords=["hazardous material", "spill response", "chemical storage", "hazmat"],
        risk_if_missing="High",
    ),
    SafetyRule(
        id="incident_reporting",
        category="Incident Reporting",
        title="Incident / near-miss reporting procedure exists",
        description="A process for reporting incidents, near misses, and conducting root cause analysis should be documented.",
        keywords=["incident report", "near miss", "accident report", "root cause analysis"],
        risk_if_missing="Medium",
    ),
    SafetyRule(
        id="training",
        category="Training & Competency",
        title="Training / competency requirements documented",
        description="Required training records, certifications, or toolbox talks should be documented.",
        keywords=["training record", "certified", "competency assessment", "toolbox talk"],
        risk_if_missing="Medium",
    ),
    SafetyRule(
        id="permit_to_work",
        category="Permit-to-Work",
        title="Permit-to-work system referenced",
        description="High-risk tasks should reference a permit-to-work or work-permit system.",
        keywords=["permit to work", "permit-to-work", "work permit"],
        risk_if_missing="High",
    ),
    SafetyRule(
        id="housekeeping",
        category="Housekeeping",
        title="Housekeeping / walkway procedure exists",
        description="Requirements for clear walkways and spill cleanup should be documented.",
        keywords=["housekeeping", "clear walkway", "spill cleanup"],
        risk_if_missing="Low",
    ),
    SafetyRule(
        id="ventilation",
        category="Ventilation & Air Quality",
        title="Ventilation / air quality monitoring documented",
        description="Exhaust systems, fume extraction, or air quality monitoring should be documented where relevant.",
        keywords=["ventilation", "air quality monitoring", "exhaust system", "fume extraction"],
        risk_if_missing="Medium",
    ),
]


@dataclass
class ComplianceMatch:
    document_id: int
    filename: str
    snippet: str


@dataclass
class ComplianceItem:
    rule_id: str
    category: str
    title: str
    description: str
    risk_level: RiskLevel
    compliant: bool
    matches: List[ComplianceMatch] = field(default_factory=list)


@dataclass
class ComplianceReport:
    generated_at: str
    documents_analyzed: List[Dict]
    compliance_score: float
    overall_risk_level: RiskLevel
    compliant_items: List[ComplianceItem]
    missing_items: List[ComplianceItem]
    summary: str
    ai_generated_summary: bool


def _find_snippet(text: str, keyword: str, context_chars: int = 90) -> Optional[str]:
    idx = text.lower().find(keyword.lower())
    if idx == -1:
        return None
    start = max(0, idx - context_chars // 2)
    end = min(len(text), idx + len(keyword) + context_chars // 2)
    snippet = text[start:end].strip()
    return ("…" if start > 0 else "") + snippet + ("…" if end < len(text) else "")


def _check_rule(rule: SafetyRule, documents: List[dict]) -> ComplianceItem:
    matches: List[ComplianceMatch] = []

    for doc in documents:
        text = doc.get("text") or ""
        if not text:
            continue
        for keyword in rule.keywords:
            snippet = _find_snippet(text, keyword)
            if snippet:
                matches.append(
                    ComplianceMatch(document_id=doc["id"], filename=doc["filename"], snippet=snippet)
                )
                break

    return ComplianceItem(
        rule_id=rule.id,
        category=rule.category,
        title=rule.title,
        description=rule.description,
        risk_level=rule.risk_if_missing,
        compliant=len(matches) > 0,
        matches=matches,
    )


def _heuristic_summary(compliant: List[ComplianceItem], missing: List[ComplianceItem], score: float) -> str:
    if not missing:
        return (
            f"All {len(compliant)} checked safety procedure categories are addressed across the "
            f"uploaded documents. Compliance score: {score:.0f}%."
        )

    missing_titles = ", ".join(m.category for m in missing[:5])
    more = f" and {len(missing) - 5} more" if len(missing) > 5 else ""
    return (
        f"{len(compliant)} of {len(compliant) + len(missing)} checked safety procedure categories are "
        f"addressed (compliance score: {score:.0f}%). Missing coverage: {missing_titles}{more}. "
        "Prioritize the Critical and High risk items first."
    )


def _ai_summary(compliant: List[ComplianceItem], missing: List[ComplianceItem], score: float) -> Optional[str]:
    if not missing:
        prompt_facts = "All checked safety procedure categories are addressed."
    else:
        lines = [f"- {m.category} (risk if missing: {m.risk_level})" for m in missing]
        prompt_facts = "Missing procedure categories:\n" + "\n".join(lines)

    prompt = (
        "You are an industrial EHS (environment, health, safety) compliance assistant. "
        f"A set of SOP documents was checked against {len(compliant) + len(missing)} standard safety "
        f"procedure categories. Compliance score: {score:.0f}%.\n\n{prompt_facts}\n\n"
        "Write a concise 2-3 sentence executive summary for a plant safety officer, in plain language, "
        "prioritizing the most urgent gaps first. Do not invent facts beyond what's given."
    )

    try:
        model = get_chat_model()
        response = model.invoke(prompt)
    except CopilotError:
        return None
    except Exception:
        return None

    content = response.content if hasattr(response, "content") else str(response)
    if isinstance(content, list):
        content = "\n".join(
            block.get("text", "") if isinstance(block, dict) else str(block) for block in content
        )
    text = content.strip() if isinstance(content, str) else None
    return text or None


def generate_compliance_report(documents: List[dict]) -> ComplianceReport:
    items = [_check_rule(rule, documents) for rule in SAFETY_RULES]
    compliant_items = [i for i in items if i.compliant]
    missing_items = [i for i in items if not i.compliant]
    missing_items.sort(key=lambda i: _RISK_ORDER.get(i.risk_level, 4))

    score = (len(compliant_items) / len(items) * 100) if items else 0.0

    if any(i.risk_level == "Critical" for i in missing_items):
        overall_risk = "Critical"
    elif any(i.risk_level == "High" for i in missing_items):
        overall_risk = "High"
    elif any(i.risk_level == "Medium" for i in missing_items):
        overall_risk = "Medium"
    else:
        overall_risk = "Low"

    ai_summary = _ai_summary(compliant_items, missing_items, score)
    summary = ai_summary or _heuristic_summary(compliant_items, missing_items, score)

    doc_refs = [{"document_id": d["id"], "filename": d["filename"]} for d in documents]

    return ComplianceReport(
        generated_at=datetime.now(timezone.utc).isoformat(),
        documents_analyzed=doc_refs,
        compliance_score=round(score, 1),
        overall_risk_level=overall_risk,
        compliant_items=compliant_items,
        missing_items=missing_items,
        summary=summary,
        ai_generated_summary=ai_summary is not None,
    )