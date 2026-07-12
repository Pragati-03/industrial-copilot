import { AlertTriangle, ShieldAlert, TrendingUp, Wrench } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { MaintenanceInsight } from "@/lib/types";

interface SummaryBarProps {
  insights: MaintenanceInsight[];
}

export function SummaryBar({ insights }: SummaryBarProps) {
  const total = insights.length;
  const recurring = insights.filter((i) => i.is_recurring).length;
  const critical = insights.filter((i) => i.severity === "Critical").length;
  const aiPowered = insights.filter((i) => i.ai_generated).length;

  const stats = [
    { label: "Assets Flagged", value: total, icon: Wrench, color: "text-primary" },
    { label: "Recurring Failures", value: recurring, icon: TrendingUp, color: "text-status-warning" },
    { label: "Critical Severity", value: critical, icon: ShieldAlert, color: "text-status-critical" },
    { label: "AI-Reasoned", value: aiPowered, icon: AlertTriangle, color: "text-accent" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <s.icon className={`h-4 w-4 shrink-0 ${s.color}`} />
            <div>
              <p className="text-lg font-semibold leading-none text-foreground">{s.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}