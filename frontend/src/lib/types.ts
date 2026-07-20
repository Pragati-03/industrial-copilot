export type DocumentStatus = "uploaded" | "processing" | "error";
export type OcrStatus = "pending" | "processing" | "done" | "error";
export type EmbeddingStatus = "pending" | "processing" | "done" | "error";

export interface DocumentRecord {
  id: number;
  original_filename: string;
  content_type: string;
  extension: string;
  size_bytes: number;
  status: DocumentStatus;
  uploaded_at: string;
  ocr_status: OcrStatus;
  extracted_text?: string | null;
  page_count?: number | null;
  ocr_error?: string | null;
  embedding_status: EmbeddingStatus;
  embedding_error?: string | null;
  chunk_count?: number | null;
}

export interface UploadResult {
  filename: string;
  success: boolean;
  document?: DocumentRecord;
  error?: string;
}

export interface UploadJob {
  id: string;
  files: File[];
  progress: number;
  status: "uploading" | "done" | "error";
  results?: UploadResult[];
  error?: string;
}

export type GraphNodeType = "document" | "equipment" | "machine" | "engineer" | "date" | "event" | "failure";

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  document_id?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
  document_id?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: { node_count: number; edge_count: number };
}

export type SeverityLevel = "Low" | "Medium" | "High" | "Critical";

export interface EntityMention {
  label: string;
  document_id: number;
  filename: string;
}

export interface DocumentRef {
  document_id: number;
  filename: string;
}

export interface MaintenanceInsight {
  equipment_id: string;
  equipment_label: string;
  equipment_type: "equipment" | "machine";
  is_recurring: boolean;
  failure_count: number;
  distinct_failure_types: string[];
  failures: EntityMention[];
  events: EntityMention[];
  engineers: string[];
  documents: DocumentRef[];
  last_event_date: string | null;
  root_cause: string;
  preventive_recommendation: string;
  severity: SeverityLevel;
  severity_reason: string;
  next_inspection_date: string | null;
  confidence: "Low" | "Medium" | "High";
  ai_generated: boolean;
}

export interface ComplianceMatch {
  document_id: number;
  filename: string;
  snippet: string;
}

export interface ComplianceItem {
  rule_id: string;
  category: string;
  title: string;
  description: string;
  risk_level: SeverityLevel;
  compliant: boolean;
  matches: ComplianceMatch[];
}

export interface ComplianceReport {
  generated_at: string;
  documents_analyzed: DocumentRef[];
  compliance_score: number;
  overall_risk_level: SeverityLevel;
  compliant_items: ComplianceItem[];
  missing_items: ComplianceItem[];
  summary: string;
  ai_generated_summary: boolean;
}

export interface CopilotSource {
  document_id: number;
  filename: string;
  chunk_index: number;
  snippet: string;
  score: number;
}

export interface CopilotAnswer {
  answer: string;
  sources: CopilotSource[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: CopilotSource[];
  isError?: boolean;
}