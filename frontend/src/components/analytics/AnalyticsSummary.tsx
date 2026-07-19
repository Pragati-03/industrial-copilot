import { FileStack, Gauge, ShieldCheck, AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  documentsUploadedTrend,
  equipmentHealth,
  complianceScoreTrend,
} from "@/lib/analytics-data";

export function AnalyticsSummary() {
  const latestMonth = documentsUploadedTrend[documentsUploadedTrend.length - 1];
  const totalThisMonth = latestMonth.pdf + latestMonth.docx + latestMonth.image + latestMonth.txt;

  const avgHealth = Math.round(
    equipmentHealth.reduce((sum, e) => sum + e.score, 0) / equipmentHealth.length
  );

  const criticalCount = equipmentHealth.filter((e) => e.band === "Critical").length;

  const latestCompliance = complianceScoreTrend[complianceScoreTrend.length - 1].score;

  const stats = [
    { label: "Documents This Month", value: totalThisMonth.toLocaleString(), icon: FileStack, color: "text-primary" },
    { label: "Avg. Equipment Health", value: `${avgHealth}%`, icon: Gauge, color: "text-status-safe" },
    { label: "Critical Assets", value: criticalCount, icon: AlertTriangle, color: "text-status-critical" },
    { label: "Compliance Score", value: `${latestCompliance}%`, icon: ShieldCheck, color: "text-accent" },
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