import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { equipmentHealth } from "@/lib/analytics-data";

const tooltipStyle = { borderRadius: 8, border: "1px solid hsl(214 20% 88%)", fontSize: 12 };

const BAND_COLOR: Record<string, string> = {
  Healthy: "#2F855A",
  Watch: "#D98E2B",
  Critical: "#C53030",
};

export function EquipmentHealthChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Equipment Health</CardTitle>
        <CardDescription>Health score by asset (0-100, higher is better)</CardDescription>
      </CardHeader>
      <CardContent className="h-72 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={equipmentHealth}
            layout="vertical"
            margin={{ left: 10, right: 20, top: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} />
            <YAxis
              type="category"
              dataKey="equipment"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              width={110}
            />
            <ReferenceLine x={50} stroke="hsl(214 20% 80%)" strokeDasharray="3 3" />
            <ReferenceLine x={75} stroke="hsl(214 20% 80%)" strokeDasharray="3 3" />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}`, "Health score"]} />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={14}>
              {equipmentHealth.map((entry) => (
                <Cell key={entry.equipment} fill={BAND_COLOR[entry.band]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}