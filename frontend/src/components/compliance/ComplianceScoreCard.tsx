import { Download, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { severityMeta } from "@/components/maintenance/severity";
import type { ComplianceReport } from "@/lib/types";

interface ComplianceScoreCardProps {
  report: ComplianceReport;
  onDownload: () => void;
  downloading: boolean;
}

export function ComplianceScoreCard({ report, onDownload, downloading }: ComplianceScoreCardProps) {
  const meta = severityMeta(report.overall_risk_level);

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground">
              {report.compliance_score.toFixed(0)}%
            </span>
            <span className="text-[11px] text-muted-foreground">Compliance Score</span>
          </div>

          <div className="h-10 w-px bg-border" />

          <div className="flex flex-col items-start gap-1">
            <Badge variant={meta.badgeVariant} className="gap-1">
              <ShieldCheck className="h-3 w-3" />
              {report.overall_risk_level} risk
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              {report.documents_analyzed.length} document
              {report.documents_analyzed.length === 1 ? "" : "s"} analyzed
              {report.ai_generated_summary ? " · AI summary" : " · heuristic summary"}
            </span>
          </div>
        </div>

        <p className="flex-1 text-sm text-muted-foreground sm:max-w-md">{report.summary}</p>

        <Button onClick={onDownload} disabled={downloading} className="shrink-0 gap-1.5">
          <Download className="h-4 w-4" />
          {downloading ? "Preparing…" : "Download Report"}
        </Button>
      </CardContent>
    </Card>
  );
}