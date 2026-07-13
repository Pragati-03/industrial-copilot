import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ComplianceScoreCard } from "@/components/compliance/ComplianceScoreCard";
import { ComplianceItemList } from "@/components/compliance/ComplianceItemList";
import { downloadComplianceReportPdf, fetchComplianceReport } from "@/lib/api";
import type { ComplianceReport } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Compliance() {
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchComplianceReport();
      setReport(data);
      setError(null);
    } catch {
      setError("Could not load the compliance report. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadComplianceReportPdf();
    } catch {
      setError("Could not download the report. Is the backend running?");
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
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {error && (
        <p className="rounded-md border border-status-critical/30 bg-status-critical/10 px-3 py-2 text-sm text-status-critical">
          {error}
        </p>
      )}

      {loading && !report && (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Checking documents against safety procedure categories…
        </div>
      )}

      {!loading && report && report.documents_analyzed.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <ShieldCheck className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No documents with extracted text yet. Upload and OCR your SOPs to run a compliance
            check.
          </p>
        </div>
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