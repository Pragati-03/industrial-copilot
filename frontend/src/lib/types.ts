export type DocumentStatus = "uploaded" | "processing" | "error";

export interface DocumentRecord {
  id: number;
  original_filename: string;
  content_type: string;
  extension: string;
  size_bytes: number;
  status: DocumentStatus;
  uploaded_at: string;
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