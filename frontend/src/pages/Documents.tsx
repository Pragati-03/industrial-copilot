import { useCallback, useState } from "react";

import { Dropzone } from "@/components/documents/dropzone";
import { UploadQueue } from "@/components/documents/uploadQueue";
import { DocumentsList } from "@/components/documents/DocumentsList";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { LoadingState } from "@/components/shared/LoadingState";
import { useFetch } from "@/hooks/useFetch";
import { fetchDocuments, deleteDocumentApi, uploadDocumentsWithProgress } from "@/lib/api";
import type { UploadJob } from "@/lib/types";

export function Documents() {
  const { data: documents, loading, error, reload } = useFetch(
    fetchDocuments,
    [],
    "Could not load documents. Is the backend running?"
  );

  const [jobs, setJobs] = useState<UploadJob[]>([]);

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      const jobId = crypto.randomUUID();
      setJobs((prev) => [{ id: jobId, files, progress: 0, status: "uploading" }, ...prev]);

      uploadDocumentsWithProgress(files, (percent) => {
        setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, progress: percent } : job)));
      })
        .then((results) => {
          setJobs((prev) =>
            prev.map((job) => (job.id === jobId ? { ...job, status: "done", progress: 100, results } : job))
          );
          reload();
        })
        .catch((err: Error) => {
          setJobs((prev) =>
            prev.map((job) => (job.id === jobId ? { ...job, status: "error", error: err.message } : job))
          );
        });
    },
    [reload]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      await deleteDocumentApi(id);
      reload();
    },
    [reload]
  );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Documents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload manuals, SOPs, drawings, and reports for OCR, embedding, and analysis.
        </p>
      </div>

      <Dropzone onFilesSelected={handleFilesSelected} />
      <UploadQueue jobs={jobs} />

      {error && <ErrorBanner message={error} onRetry={reload} />}
      {loading && !documents && <LoadingState message="Loading documents…" />}
      {documents && <DocumentsList documents={documents} onDelete={handleDelete} />}
    </div>
  );
}