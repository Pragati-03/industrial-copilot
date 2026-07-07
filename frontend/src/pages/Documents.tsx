import { useCallback, useEffect, useState } from "react";

import { Dropzone } from "@/components/documents/dropzone";
import { UploadQueue } from "@/components/documents/uploadQueue";
import { DocumentsList } from "@/components/documents/DocumentsList";
import { fetchDocuments, deleteDocumentApi, uploadDocumentsWithProgress } from "@/lib/api";
import type { DocumentRecord, UploadJob } from "@/lib/types";

export function Documents() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
      setLoadError(null);
    } catch {
      setLoadError("Could not load documents. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      const jobId = crypto.randomUUID();
      setJobs((prev) => [{ id: jobId, files, progress: 0, status: "uploading" }, ...prev]);

      uploadDocumentsWithProgress(files, (percent) => {
        setJobs((prev) =>
          prev.map((job) => (job.id === jobId ? { ...job, progress: percent } : job))
        );
      })
        .then((results) => {
          setJobs((prev) =>
            prev.map((job) =>
              job.id === jobId ? { ...job, status: "done", progress: 100, results } : job
            )
          );
          loadDocuments();
        })
        .catch((err: Error) => {
          setJobs((prev) =>
            prev.map((job) =>
              job.id === jobId ? { ...job, status: "error", error: err.message } : job
            )
          );
        });
    },
    [loadDocuments]
  );

  const handleDelete = useCallback(async (id: number) => {
    await deleteDocumentApi(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Documents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload manuals, SOPs, drawings, and reports. OCR and parsing arrive in a later phase.
        </p>
      </div>

      <Dropzone onFilesSelected={handleFilesSelected} />

      <UploadQueue jobs={jobs} />

      {loadError && (
        <p className="rounded-md border border-status-critical/30 bg-status-critical/10 px-3 py-2 text-sm text-status-critical">
          {loadError}
        </p>
      )}

      {!loading && <DocumentsList documents={documents} onDelete={handleDelete} />}
    </div>
  );
}