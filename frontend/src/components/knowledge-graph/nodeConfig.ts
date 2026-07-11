import type { GraphNodeType } from "@/lib/types";

interface NodeTypeMeta {
  label: string;
  color: string;
  radius: number;
}

const NODE_TYPE_CONFIG_MAP: Record<GraphNodeType, NodeTypeMeta> = {
  document: { label: "Document", color: "#5B7083", radius: 10 },
  equipment: { label: "Equipment ID", color: "#0F2A44", radius: 8 },
  machine: { label: "Machine", color: "#D98E2B", radius: 8 },
  engineer: { label: "Engineer", color: "#2F855A", radius: 7 },
  date: { label: "Date", color: "#6B7280", radius: 6 },
  event: { label: "Maintenance Event", color: "#2B6CB0", radius: 7 },
  failure: { label: "Failure Type", color: "#C53030", radius: 7 },
};

export const NODE_TYPE_CONFIG = NODE_TYPE_CONFIG_MAP;

export const NODE_TYPE_ORDER: GraphNodeType[] = [
  "document",
  "equipment",
  "machine",
  "engineer",
  "date",
  "event",
  "failure",
];