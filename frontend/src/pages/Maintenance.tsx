import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InsightCard } from "@/components/maintenance/InsightCard";
import { SummaryBar } from "@/components/maintenance/SummaryBar";
import { fetchMaintenanceInsights } from "@/lib/api";
import type { MaintenanceInsight } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Maintenance() {
  const [insights, setInsights] = useState<MaintenanceInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyRecurring, setOnlyRecurring] = useState(false);

  const load = useCallback(async (recurringOnly: boolean) => {
    setLoading(true);
    try {
      const data = await fetchMaintenanceInsights(recurringOnly);
      setInsights(data);
      setError(null);
    } catch {
      setError("Could not load maintenance insights. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(onlyRecurring);
  }, [load, onlyRecurring]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Maintenance & RCA
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Recurring failures, likely root causes, and preventive recommendations, reasoned
            from your uploaded documents.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant={onlyRecurring ? "default" : "outline"}
            size="sm"
            onClick={() => setOnlyRecurring((v) => !v)}
          >
            Recurring only
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => load(onlyRecurring)}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-status-critical/30 bg-status-critical/10 px-3 py-2 text-sm text-status-critical">
          {error}
        </p>
      )}

      {!loading && insights.length > 0 && <SummaryBar insights={insights} />}

      {loading && insights.length === 0 && (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Analyzing documents…
        </div>
      )}

      {!loading && insights.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <Wrench className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {onlyRecurring
              ? "No recurring failures detected yet."
              : "No failure history found. Upload and OCR maintenance documents to populate this view."}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {insights.map((insight) => (
          <InsightCard key={insight.equipment_id} insight={insight} />
        ))}
      </div>
    </div>
  );
}