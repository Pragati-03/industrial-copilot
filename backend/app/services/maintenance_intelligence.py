"""
Maintenance Intelligence service.

For each document, extracts entities (equipment, machines, failures,
events, dates, engineers) across every sentence, then associates every
failure/event/date/engineer found anywhere in that document with every
equipment/machine entity also found in that document. This is
document-level association rather than sentence-level co-occurrence:
equipment and its failures are frequently described in different
sentences of the same report.

Cases with 2+ failure occurrences (possibly across different documents)
are flagged as recurring. Gemini is asked to reason over the assembled
facts for root cause, a preventive recommendation, severity, and a
recommended next inspection date. If Gemini is unavailable or its
response can't be parsed, a deterministic heuristic fallback still
produces a usable result, so this endpoint never hard-fails.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import date, timedelta
from typing import Dict, List, Optional, Tuple

from dateutil import parser as dateutil_parser

from app.services.copilot import CopilotError, get_chat_model
from app.services.knowledge_graph import SENTENCE_SPLIT_RE, _extract_entities_from_sentence

CRITICAL_FAILURE_KEYWORDS = {
    "bearing failure", "overheating", "short circuit", "crack",
    "fatigue", "seal failure",
}

DEFAULT_INTERVAL_DAYS = 30
URGENT_INTERVAL_DAYS = 14


@dataclass
class MaintenanceInsight:
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
    last_event_date: Optional[str]
    root_cause: str
    preventive_recommendation: str
    severity: str
    severity_reason: str
    next_inspection_date: Optional[str]
    confidence: str
    ai_generated: bool


def _parse_date(text: str) -> Optional[date]:
    try:
        return dateutil_parser.parse(text, fuzzy=True).date()
    except (ValueError, OverflowError):
        return None


def _collect_equipment_cases(documents: List[dict]) -> Dict[str, dict]:
    cases: Dict[str, dict] = {}

    def ensure_case(node_id: str, label: str, node_type: str) -> dict:
        if node_id not in cases:
            cases[node_id] = {
                "id": node_id,
                "type": node_type,
                "label": label,
                "failures": [],
                "events": [],
                "dates": [],
                "engineers": [],
                "document_ids": set(),
            }
        return cases[node_id]

    for doc in documents:
        text = doc.get("text") or ""
        sentences = [s.strip() for s in SENTENCE_SPLIT_RE.split(text) if s.strip()]

        doc_entities = []
        for sentence in sentences:
            doc_entities.extend(_extract_entities_from_sentence(sentence))

        by_type: Dict[str, dict] = {
            "equipment": {}, "machine": {}, "failure": {}, "event": {}, "date": {}, "engineer": {},
        }
        for entity in doc_entities:
            by_type.setdefault(entity.type, {})[entity.node_id] = entity

        equipment_entities = {**by_type["equipment"], **by_type["machine"]}
        if not equipment_entities:
            continue

        def entries(bucket: dict) -> List[dict]:
            return [
                {"label": e.value, "document_id": doc["id"], "filename": doc["filename"]}
                for e in bucket.values()
            ]

        failure_entries = entries(by_type["failure"])
        event_entries = entries(by_type["event"])
        date_entries = entries(by_type["date"])
        engineer_entries = entries(by_type["engineer"])

        for equip_id, equip_entity in equipment_entities.items():
            case = ensure_case(equip_id, equip_entity.value, equip_entity.type)
            case["document_ids"].add(doc["id"])
            case["failures"].extend(failure_entries)
            case["events"].extend(event_entries)
            case["dates"].extend(date_entries)
            case["engineers"].extend(engineer_entries)

    return cases


def _merge_duplicate_assets(cases: Dict[str, dict]) -> Dict[str, dict]:
    """
    Entity extraction produces both a bare equipment-ID node (e.g. "C-12")
    and a machine node that includes it (e.g. "Compressor C-12") for the
    same physical asset. When both appear in the same document(s), merge
    the equipment-ID case into the richer machine case so the UI shows
    one card per asset instead of two near-duplicates.
    """
    machine_cases = {cid: c for cid, c in cases.items() if c["type"] == "machine"}
    equipment_cases = {cid: c for cid, c in cases.items() if c["type"] == "equipment"}

    absorbed: set = set()

    for eq_id, eq_case in equipment_cases.items():
        eq_label_lower = eq_case["label"].lower()
        for m_case in machine_cases.values():
            shares_docs = eq_case["document_ids"] & m_case["document_ids"]
            if eq_label_lower in m_case["label"].lower() and shares_docs:
                m_case["failures"].extend(eq_case["failures"])
                m_case["events"].extend(eq_case["events"])
                m_case["dates"].extend(eq_case["dates"])
                m_case["engineers"].extend(eq_case["engineers"])
                m_case["document_ids"] |= eq_case["document_ids"]
                absorbed.add(eq_id)
                break

    for m_case in machine_cases.values():
        for key in ("failures", "events", "dates", "engineers"):
            seen = set()
            deduped = []
            for entry in m_case[key]:
                sig = (entry["label"], entry["document_id"])
                if sig not in seen:
                    seen.add(sig)
                    deduped.append(entry)
            m_case[key] = deduped

    return {cid: c for cid, c in cases.items() if cid not in absorbed}


def _heuristic_severity(case: dict) -> Tuple[str, str]:
    count = len(case["failures"])
    has_critical = any(
        any(k in f["label"].lower() for k in CRITICAL_FAILURE_KEYWORDS) for f in case["failures"]
    )

    if count >= 3 or (has_critical and count >= 2):
        return "Critical", f"{count} failure event(s) recorded, including a high-risk failure type."
    if count == 2 or has_critical:
        return "High", "Repeat or high-risk failure indicators found in the source documents."
    if count == 1:
        return "Medium", "A single failure event is on record; monitor for recurrence."
    return "Low", "No significant failure history found."


def _heuristic_analysis(case: dict, last_date: Optional[date]) -> dict:
    severity, severity_reason = _heuristic_severity(case)
    failure_labels = ", ".join(sorted({f["label"] for f in case["failures"]})) or "no specific failure recorded"
    interval = URGENT_INTERVAL_DAYS if severity in ("High", "Critical") else DEFAULT_INTERVAL_DAYS
    next_inspection = (last_date + timedelta(days=interval)).isoformat() if last_date else None

    return {
        "root_cause": (
            f"Based on {len(case['document_ids'])} document(s), {case['label']} shows recorded "
            f"instances of {failure_labels}."
        ),
        "preventive_recommendation": (
            f"Increase inspection frequency for {case['label']} and specifically check for "
            f"{failure_labels} before the next scheduled maintenance window."
        ),
        "severity": severity,
        "severity_reason": severity_reason,
        "next_inspection_date": next_inspection,
        "confidence": "Low",
    }


PROMPT_TEMPLATE = """You are an industrial maintenance intelligence system. Analyze the equipment history below and respond with STRICT JSON only (no markdown formatting, no commentary) matching this exact shape:

{{
  "root_cause": "<likely root cause, 1-2 sentences, grounded only in the facts given>",
  "preventive_recommendation": "<specific preventive maintenance action, 1-2 sentences>",
  "severity": "<one of: Low, Medium, High, Critical>",
  "severity_reason": "<1 sentence justifying the severity>",
  "next_inspection_date": "<a specific date in YYYY-MM-DD format if you can reasonably estimate one from the most recent known date, otherwise null>",
  "confidence": "<one of: Low, Medium, High>"
}}

Equipment: {equipment_label}

Recorded failures ({failure_count} total):
{failures_text}

Recorded maintenance events:
{events_text}

Engineers involved: {engineers_text}
Most recent known date: {last_date_text}

Respond with the JSON object only, no other text."""


def _extract_json_block(text: str) -> str:
    text = text.strip()
    fenced = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if fenced:
        return fenced.group(1)
    brace_match = re.search(r"\{.*\}", text, re.DOTALL)
    return brace_match.group(0) if brace_match else text


def _ai_analysis(case: dict, last_date: Optional[date]) -> Optional[dict]:
    failures_text = "\n".join(f"- {f['label']} (from {f['filename']})" for f in case["failures"]) or "None recorded"
    events_text = "\n".join(f"- {e['label']} (from {e['filename']})" for e in case["events"]) or "None recorded"
    engineers_text = ", ".join(sorted({e["label"] for e in case["engineers"]})) or "Not specified"
    last_date_text = last_date.isoformat() if last_date else "Not available"

    prompt = PROMPT_TEMPLATE.format(
        equipment_label=case["label"],
        failure_count=len(case["failures"]),
        failures_text=failures_text,
        events_text=events_text,
        engineers_text=engineers_text,
        last_date_text=last_date_text,
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

    try:
        parsed = json.loads(_extract_json_block(content))
    except (json.JSONDecodeError, AttributeError):
        return None

    if parsed.get("severity") not in ("Low", "Medium", "High", "Critical"):
        return None

    return parsed


def _build_insight(case: dict) -> MaintenanceInsight:
    dates = [d for d in (_parse_date(entry["label"]) for entry in case["dates"]) if d is not None]
    last_date = max(dates) if dates else None

    ai_result = _ai_analysis(case, last_date)
    ai_generated = ai_result is not None
    result = ai_result or _heuristic_analysis(case, last_date)

    documents = [
        {
            "document_id": did,
            "filename": next(
                (f["filename"] for f in case["failures"] + case["events"] if f["document_id"] == did),
                f"document {did}",
            ),
        }
        for did in sorted(case["document_ids"])
    ]

    return MaintenanceInsight(
        equipment_id=case["id"],
        equipment_label=case["label"],
        equipment_type=case["type"],
        is_recurring=len(case["failures"]) >= 2,
        failure_count=len(case["failures"]),
        distinct_failure_types=sorted({f["label"] for f in case["failures"]}),
        failures=case["failures"],
        events=case["events"],
        engineers=sorted({e["label"] for e in case["engineers"]}),
        documents=documents,
        last_event_date=last_date.isoformat() if last_date else None,
        root_cause=result["root_cause"],
        preventive_recommendation=result["preventive_recommendation"],
        severity=result["severity"],
        severity_reason=result["severity_reason"],
        next_inspection_date=result.get("next_inspection_date"),
        confidence=result.get("confidence", "Low"),
        ai_generated=ai_generated,
    )


_SEVERITY_ORDER = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}


def get_maintenance_insights(
    documents: List[dict], only_recurring: bool = False
) -> List[MaintenanceInsight]:
    cases = _collect_equipment_cases(documents)
    cases = _merge_duplicate_assets(cases)

    insights = [_build_insight(case) for case in cases.values() if case["failures"]]

    if only_recurring:
        insights = [i for i in insights if i.is_recurring]

    insights.sort(key=lambda i: (_SEVERITY_ORDER.get(i.severity, 4), -i.failure_count))
    return insights