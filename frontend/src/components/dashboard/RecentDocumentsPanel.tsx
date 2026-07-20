import { FileText, ImageIcon, FileType, CheckCircle2, Loader2, XCircle, Clock } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/Loadingstate";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { EmptyState } from "@/components/shared/EmptyState";
import { useFetch } from "@/hooks/useFetch";
import { fetchDocuments } from "@/lib/api";

function iconForExtension(ext: string) {
  const e = ext.toLowerCase();
  if (e === ".pdf") return FileText;
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(e)) return ImageIcon;
  if (e === ".docx") return FileType;
  return FileText;
}

const OCR_STATUS_ICON = {
  done: { icon: CheckCircle2, className: "text-status-safe" },
  processing: { icon: Loader2, className: "text-accent animate-spin" },
  pending: { icon: Clock, className: "text-muted-foreground" },
  error: { icon: XCircle, className: "text-status-critical" },
};

export function RecentDocumentsPanel() {
  const { data: documents, loading, error, reload } = useFetch(
    fetchDocuments,
    [],
    "Could not load recent documents"
  );

  const recent = (documents ?? [])
    .slice()
    .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
    .slice(0, 6);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="text-base">Recent Documents</CardTitle>
        <CardDescription>Latest uploads and their processing status, live from the API</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {loading && <LoadingState message="Loading recent documents…" />}
        {!loading && error && <ErrorBanner message={error} onRetry={reload} />}
        {!loading && !error && recent.length === 0 && (
          <EmptyState icon={FileText} message="No documents uploaded yet. Upload something on the Documents page to see it here." />
        )}
        {!loading && !error && recent.length > 0 && (
          <div className="space-y-1">
            {recent.map((doc) => {
              const Icon = iconForExtension(doc.extension);
              const statusMeta = OCR_STATUS_ICON[doc.ocr_status];
              const StatusIcon = statusMeta.icon;
              return (
                <div key={doc.id} className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-secondary/60">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{doc.original_filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.uploaded_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <StatusIcon className={`h-4 w-4 shrink-0 ${statusMeta.className}`} />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}