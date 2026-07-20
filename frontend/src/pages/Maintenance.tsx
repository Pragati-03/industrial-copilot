import { useState } from "react";
import { RefreshCw, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InsightCard } from "@/components/maintenance/InsightCard";
import { SummaryBar } from "@/components/maintenance/SummaryBar";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { EmptyState } from "@/components/shared/EmptyState";
import { useFetch } from "@/hooks/useFetch";
import { fetchMaintenanceInsights } from "@/lib/api";
import { cn } from "@/lib/utils";

export function Maintenance() {
  const [onlyRecurring, setOnlyRecurring] = useState(false);

  const { data: insights, loading, error, reload } = useFetch(
    () => fetchMaintenanceInsights(onlyRecurring),
    [onlyRecurring],
    "Could not load maintenance insights. Is the backend running?"
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Maintenance & RCA</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Recurring failures, likely root causes, and preventive recommendations, reasoned from
            your uploaded documents.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant={onlyRecurring ? "default" : "outline"} size="sm" onClick={() => setOnlyRecurring((v) => !v)}>
            Recurring only
          </Button>
          <Button variant="outline" size="sm" onClick={reload} disabled={loading} className="gap-1.5">
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={reload} />}
      {!loading && insights && insights.length > 0 && <SummaryBar insights={insights} />}
      {loading && !insights && <LoadingState message="Analyzing documents…" />}

      {!loading && insights && insights.length === 0 && !error && (
        <EmptyState
          icon={Wrench}
          message={
            onlyRecurring
              ? "No recurring failures detected yet."
              : "No failure history found. Upload and OCR maintenance documents to populate this view."
          }
        />
      )}

      <div className="space-y-4">
        {insights?.map((insight) => (
          <InsightCard key={insight.equipment_id} insight={insight} />
        ))}
      </div>
    </div>
  );
}