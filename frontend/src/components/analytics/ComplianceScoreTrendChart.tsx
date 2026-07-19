import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { complianceScoreTrend, COMPLIANCE_TARGET } from "@/lib/analytics-data";

const tooltipStyle = { borderRadius: 8, border: "1px solid hsl(214 20% 88%)", fontSize: 12 };

export function ComplianceScoreTrendChart() {
  const latest = complianceScoreTrend[complianceScoreTrend.length - 1].score;
  const onTarget = latest >= COMPLIANCE_TARGET;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Compliance Score Trend</CardTitle>
        <CardDescription>
          Weekly rolling score vs. {COMPLIANCE_TARGET}% target ·{" "}
          <span className={onTarget ? "text-status-safe" : "text-status-warning"}>
            currently {latest}%
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="h-72 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={complianceScoreTrend} margin={{ left: -20, right: 10, top: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
            <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis domain={[40, 100]} tickLine={false} axisLine={false} fontSize={12} />
            <ReferenceLine
              y={COMPLIANCE_TARGET}
              stroke="#D98E2B"
              strokeDasharray="4 4"
              label={{ value: "Target", position: "insideTopRight", fontSize: 11, fill: "#D98E2B" }}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#0F2A44"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}