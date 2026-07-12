import {
  AlertTriangle,
  Calendar,
  FileText,
  Sparkles,
  User,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { MaintenanceInsight } from "@/lib/types";
import { severityMeta } from "@/components/maintenance/severity";

function formatDate(iso: string | null): string {
  if (!iso) return "Not enough data";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function isUpcomingSoon(iso: string | null): boolean {
  if (!iso) return false;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return false;
  const daysAway = (target - Date.now()) / (1000 * 60 * 60 * 24);
  return daysAway <= 14;
}

interface InsightCardProps {
  insight: MaintenanceInsight;
}

export function InsightCard({ insight }: InsightCardProps) {
  const meta = severityMeta(insight.severity);
  const soon = isUpcomingSoon(insight.next_inspection_date);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: `${meta.dotColor}1A`, color: meta.dotColor }}
          >
            <Wrench className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">
                {insight.equipment_label}
              </h3>
              {insight.is_recurring && (
                <Badge variant="critical" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Recurring
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {insight.failure_count} failure{insight.failure_count === 1 ? "" : "s"} recorded ·{" "}
              {insight.documents.length} document{insight.documents.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Badge variant={meta.badgeVariant}>{insight.severity}</Badge>
          {insight.ai_generated ? (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-accent" />
              AI reasoning
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground">Heuristic estimate</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="flex flex-wrap gap-1.5">
          {insight.distinct_failure_types.map((f) => (
            <Badge key={f} variant="outline">
              {f}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Likely root cause</p>
            <p className="mt-1 text-sm text-foreground">{insight.root_cause}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Preventive recommendation
            </p>
            <p className="mt-1 text-sm text-foreground">{insight.preventive_recommendation}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">{insight.severity_reason}</p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-3 text-xs">
          <div
            className={
              soon
                ? "flex items-center gap-1.5 font-medium text-status-critical"
                : "flex items-center gap-1.5 text-muted-foreground"
            }
          >
            <Calendar className="h-3.5 w-3.5" />
            Next inspection: {formatDate(insight.next_inspection_date)}
          </div>

          {insight.engineers.length > 0 && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              {insight.engineers.join(", ")}
            </div>
          )}

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            {insight.documents.map((d) => d.filename).join(", ")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}