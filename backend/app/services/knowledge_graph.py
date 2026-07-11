"""
Knowledge Graph service.

Extracts entities (equipment IDs, machine names, engineers, dates,
maintenance events, failure types) from each document's OCR/extracted
text using pattern-based extraction, then builds a NetworkX graph
connecting entities that co-occur within the same sentence. Documents
are included as nodes too, so every fact can be traced back to its
source file.

Pattern-based extraction (rather than a full NLP/NER model) is used
deliberately: it requires no extra model downloads, runs fast, and is
robust to imperfect OCR text -- at the cost of being less precise than
a trained NER model would be on clean text.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Dict, List, Tuple, TypedDict

import networkx as nx

# --- Entity patterns -------------------------------------------------------

EQUIPMENT_ID_RE = re.compile(r"\b([A-Z]{1,4}-\d{1,5})\b")

MACHINE_KEYWORDS = [
    "compressor", "pump", "turbine", "boiler", "motor", "valve",
    "generator", "conveyor", "fan", "chiller", "transformer",
    "condenser", "reactor", "furnace", "gearbox", "bearing assembly",
]
MACHINE_RE = re.compile(
    r"\b(" + "|".join(MACHINE_KEYWORDS) + r")\b(?:\s+([A-Z]{1,4}-\d{1,5}))?",
    re.IGNORECASE,
)

ENGINEER_ROLE_RE = re.compile(
    r"\b(?:Engineer|Technician|Inspector|Officer|Operator)s?:?\s+"
    r"([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)\b"
)
ENGINEER_INITIAL_RE = re.compile(r"\b([A-Z]\.\s?[A-Z][a-zA-Z]+)\b")

_MONTHS = (
    r"January|February|March|April|May|June|July|August|September|"
    r"October|November|December"
)
DATE_PATTERNS = [
    re.compile(r"\b\d{4}-\d{2}-\d{2}\b"),
    re.compile(r"\b\d{1,2}/\d{1,2}/\d{2,4}\b"),
    re.compile(rf"\b(?:{_MONTHS})\s+\d{{1,2}},?\s+\d{{4}}\b", re.IGNORECASE),
    re.compile(rf"\b\d{{1,2}}\s+(?:{_MONTHS})\s+\d{{4}}\b", re.IGNORECASE),
]

MAINTENANCE_EVENT_KEYWORDS = [
    "inspection", "lubrication", "repair", "replacement", "overhaul",
    "calibration", "cleaning", "shutdown", "maintenance", "audit",
    "servicing", "installation", "commissioning",
]
MAINTENANCE_EVENT_RE = re.compile(
    r"\b(" + "|".join(MAINTENANCE_EVENT_KEYWORDS) + r")\b", re.IGNORECASE
)

FAILURE_TYPE_KEYWORDS = [
    "bearing failure", "vibration", "overheating", "corrosion", "leak",
    "crack", "wear", "fatigue", "short circuit", "blockage",
    "misalignment", "seal failure", "oil contamination", "cavitation",
]
FAILURE_TYPE_RE = re.compile(
    r"\b(" + "|".join(FAILURE_TYPE_KEYWORDS) + r")\b", re.IGNORECASE
)

# Doesn't split on a single capital letter + period (e.g. "S. Rao"),
# only on real sentence-ending punctuation followed by a new sentence.
SENTENCE_SPLIT_RE = re.compile(r"(?<!\b[A-Z]\.)(?<=[.!?])\s+(?=[A-Z])|\n+")


class DocInput(TypedDict):
    id: int
    filename: str
    text: str


@dataclass(frozen=True)
class Entity:
    type: str  # equipment | machine | engineer | date | event | failure
    value: str  # normalized display value

    @property
    def node_id(self) -> str:
        return f"{self.type}:{self.value.lower()}"


def _extract_entities_from_sentence(sentence: str) -> List[Entity]:
    entities: List[Entity] = []

    for match in EQUIPMENT_ID_RE.finditer(sentence):
        entities.append(Entity("equipment", match.group(1).upper()))

    for match in MACHINE_RE.finditer(sentence):
        machine_word = match.group(1).title()
        equipment_id = match.group(2)
        if equipment_id:
            entities.append(Entity("machine", f"{machine_word} {equipment_id.upper()}"))
        else:
            entities.append(Entity("machine", machine_word))

    for match in ENGINEER_ROLE_RE.finditer(sentence):
        entities.append(Entity("engineer", match.group(1)))
    for match in ENGINEER_INITIAL_RE.finditer(sentence):
        entities.append(Entity("engineer", match.group(1)))

    for pattern in DATE_PATTERNS:
        for match in pattern.finditer(sentence):
            entities.append(Entity("date", match.group(0)))

    for match in MAINTENANCE_EVENT_RE.finditer(sentence):
        entities.append(Entity("event", match.group(1).title()))

    for match in FAILURE_TYPE_RE.finditer(sentence):
        entities.append(Entity("failure", match.group(1).title()))

    seen = set()
    unique: List[Entity] = []
    for e in entities:
        if e.node_id not in seen:
            seen.add(e.node_id)
            unique.append(e)
    return unique


# Relationship label inferred purely from the pair of entity types that
# co-occur in the same sentence.
RELATION_LABELS: Dict[Tuple[str, str], str] = {
    ("engineer", "equipment"): "PERFORMED_ON",
    ("engineer", "machine"): "PERFORMED_ON",
    ("engineer", "event"): "PERFORMED",
    ("engineer", "date"): "ACTIVE_ON",
    ("equipment", "event"): "HAD_EVENT",
    ("machine", "event"): "HAD_EVENT",
    ("equipment", "failure"): "EXPERIENCED",
    ("machine", "failure"): "EXPERIENCED",
    ("equipment", "date"): "EVENT_DATE",
    ("machine", "date"): "EVENT_DATE",
    ("event", "date"): "OCCURRED_ON",
    ("failure", "date"): "OCCURRED_ON",
    ("machine", "equipment"): "REFERS_TO",
    ("event", "failure"): "RELATED_TO",
}


def _relation_for(type_a: str, type_b: str) -> str:
    if (type_a, type_b) in RELATION_LABELS:
        return RELATION_LABELS[(type_a, type_b)]
    if (type_b, type_a) in RELATION_LABELS:
        return RELATION_LABELS[(type_b, type_a)]
    return "MENTIONED_WITH"


def build_graph(documents: List[DocInput]) -> nx.MultiDiGraph:
    """
    Returns a NetworkX MultiDiGraph with document nodes, entity nodes,
    MENTIONS edges (document -> entity), and inferred relation edges
    between entities that co-occur in the same sentence.
    """
    graph = nx.MultiDiGraph()

    for doc in documents:
        doc_node_id = f"document:{doc['id']}"
        graph.add_node(
            doc_node_id,
            type="document",
            label=doc["filename"],
            document_id=doc["id"],
        )

        text = doc.get("text") or ""
        sentences = [s.strip() for s in SENTENCE_SPLIT_RE.split(text) if s.strip()]

        for sentence in sentences:
            entities = _extract_entities_from_sentence(sentence)
            if not entities:
                continue

            for entity in entities:
                if not graph.has_node(entity.node_id):
                    graph.add_node(entity.node_id, type=entity.type, label=entity.value)
                if not graph.has_edge(doc_node_id, entity.node_id, key="MENTIONS"):
                    graph.add_edge(
                        doc_node_id, entity.node_id, key="MENTIONS", relation="MENTIONS"
                    )

            for i in range(len(entities)):
                for j in range(i + 1, len(entities)):
                    a, b = entities[i], entities[j]
                    if a.node_id == b.node_id:
                        continue
                    relation = _relation_for(a.type, b.type)
                    edge_key = f"{relation}:{doc['id']}"
                    if graph.has_edge(a.node_id, b.node_id, key=edge_key):
                        graph[a.node_id][b.node_id][edge_key]["weight"] += 1
                    else:
                        graph.add_edge(
                            a.node_id,
                            b.node_id,
                            key=edge_key,
                            relation=relation,
                            weight=1,
                            document_id=doc["id"],
                        )

    return graph


def graph_to_json(graph: nx.MultiDiGraph) -> dict:
    nodes = [
        {
            "id": node_id,
            "type": data.get("type"),
            "label": data.get("label"),
            **({"document_id": data["document_id"]} if "document_id" in data else {}),
        }
        for node_id, data in graph.nodes(data=True)
    ]

    edges = [
        {
            "source": u,
            "target": v,
            "relation": data.get("relation"),
            "weight": data.get("weight", 1),
            **({"document_id": data["document_id"]} if "document_id" in data else {}),
        }
        for u, v, _key, data in graph.edges(keys=True, data=True)
    ]

    return {
        "nodes": nodes,
        "edges": edges,
        "stats": {
            "node_count": graph.number_of_nodes(),
            "edge_count": graph.number_of_edges(),
        },
    }