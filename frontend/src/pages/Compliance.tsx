import { useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ComplianceScoreCard } from "@/components/compliance/ComplianceScoreCard";
import { ComplianceItemList } from "@/components/compliance/ComplianceItemList";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { EmptyState } from "@/components/shared/EmptyState";
import { downloadComplianceReportPdf, fetchComplianceReport } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import { cn } from "@/lib/utils";

export function Compliance() {
  const { data: report, loading, error, reload } = useFetch(
    fetchComplianceReport,
    [],
    "Could not load the compliance report. Is the backend running?"
  );

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleDownload() {
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadComplianceReportPdf();
    } catch {
      setDownloadError("Could not download the report. Is the backend running?");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Compliance</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Uploaded SOPs checked against standard industrial safety procedure categories.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reload} disabled={loading} className="gap-1.5">
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {error && <ErrorBanner message={error} onRetry={reload} />}
      {downloadError && <ErrorBanner message={downloadError} onRetry={handleDownload} />}

      {loading && !report && <LoadingState message="Checking documents against safety procedure categories…" />}

      {!loading && report && report.documents_analyzed.length === 0 && (
        <EmptyState
          icon={ShieldCheck}
          message="No documents with extracted text yet. Upload and OCR your SOPs to run a compliance check."
        />
      )}

      {report && report.documents_analyzed.length > 0 && (
        <>
          <ComplianceScoreCard report={report} onDownload={handleDownload} downloading={downloading} />
          <ComplianceItemList
            title="Missing Procedures"
            description="Safety procedure categories not found in any uploaded document"
            items={report.missing_items}
            variant="missing"
          />
          <ComplianceItemList
            title="Compliant Items"
            description="Safety procedure categories found and where they were sourced from"
            items={report.compliant_items}
            variant="compliant"
          />
        </>
      )}
    </div>
  );
}