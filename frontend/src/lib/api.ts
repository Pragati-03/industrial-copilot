import type { DocumentRecord, UploadResult } from "@/lib/types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

import type { GraphData } from "@/lib/types";

export async function fetchKnowledgeGraph(documentId?: number): Promise<GraphData> {
  const url = new URL(`${API_BASE}/knowledge-graph`);
  if (documentId !== undefined) {
    url.searchParams.set("document_id", String(documentId));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to load knowledge graph");
  return res.json();
}

export async function fetchDocuments(): Promise<DocumentRecord[]> {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) throw new Error("Failed to load documents");
  return res.json();
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