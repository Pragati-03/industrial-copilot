import type {
  ComplianceReport,
  CopilotAnswer,
  DocumentRecord,
  GraphData,
  MaintenanceInsight,
  UploadResult,
} from "@/lib/types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

async function handleJson<T>(res: Response, errorMessage: string): Promise<T> {
  if (!res.ok) throw new Error(errorMessage);
  return res.json();
}

export async function fetchDocuments(): Promise<DocumentRecord[]> {
  const res = await fetch(`${API_BASE}/documents`);
  return handleJson(res, "Failed to load documents");
}

export async function deleteDocumentApi(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/documents/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error("Failed to delete document");
}

export function uploadDocumentsWithProgress(
  files: File[],
  onProgress: (percent: number) => void
): Promise<UploadResult[]> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    xhr.open("POST", `${API_BASE}/documents`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error("Invalid server response"));
        }
      } else {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
}

export async function fetchKnowledgeGraph(documentId?: number): Promise<GraphData> {
  const url = new URL(`${API_BASE}/knowledge-graph`);
  if (documentId !== undefined) url.searchParams.set("document_id", String(documentId));
  const res = await fetch(url.toString());
  return handleJson(res, "Failed to load knowledge graph");
}

export async function fetchMaintenanceInsights(onlyRecurring = false): Promise<MaintenanceInsight[]> {
  const url = new URL(`${API_BASE}/maintenance/insights`);
  if (onlyRecurring) url.searchParams.set("only_recurring", "true");
  const res = await fetch(url.toString());
  return handleJson(res, "Failed to load maintenance insights");
}

export async function fetchComplianceReport(): Promise<ComplianceReport> {
  const res = await fetch(`${API_BASE}/compliance/report`);
  return handleJson(res, "Failed to load compliance report");
}

export async function downloadComplianceReportPdf(): Promise<void> {
  const res = await fetch(`${API_BASE}/compliance/report/download`);
  if (!res.ok) throw new Error("Failed to download compliance report");

  const blob = await res.blob();
  const disposition = res.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? "compliance-report.pdf";

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function askCopilot(
  question: string,
  documentIds?: number[],
  topK = 5
): Promise<CopilotAnswer> {
  const res = await fetch(`${API_BASE}/copilot/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, document_ids: documentIds, top_k: topK }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? "The copilot could not answer that question");
  }

  return res.json();
}