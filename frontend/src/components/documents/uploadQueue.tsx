import { CheckCircle2, XCircle, Loader2, File as FileIcon } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UploadJob } from "@/lib/types";

interface UploadQueueProps {
  jobs: UploadJob[];
}

export function UploadQueue({ jobs }: UploadQueueProps) {
  if (jobs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upload Queue</CardTitle>
        <CardDescription>Live progress for files currently uploading</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="space-y-2 rounded-md border border-border p-3">
            {job.status === "uploading" && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Uploading {job.files.length} file{job.files.length > 1 ? "s" : ""}…
                  </span>
                  <span className="text-muted-foreground">{job.progress}%</span>
                </div>
                <Progress value={job.progress} className="h-1.5" />
              </>
            )}

            {job.status !== "uploading" &&
              job.results?.map((result) => (
                <div key={result.filename} className="flex items-center gap-3 py-1">
                  {result.success ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-status-safe" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-status-critical" />
                  )}
                  <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm text-foreground">{result.filename}</span>
                  {!result.success && (
                    <span className="ml-auto shrink-0 text-xs text-status-critical">
                      {result.error}
                    </span>
                  )}
                </div>
              ))}

            {job.status === "error" && !job.results && (
              <div className="flex items-center gap-2 text-sm text-status-critical">
                <XCircle className="h-4 w-4 shrink-0" />
                {job.error}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}