import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ingestionTrend, downtimeByCause, complianceScore } from "@/lib/dummy-data";

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid hsl(214 20% 88%)",
  fontSize: 12,
};

export function AnalyticsPanels() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Document Ingestion Trend</CardTitle>
          <CardDescription>Monthly documents processed (placeholder data)</CardDescription>
        </CardHeader>
        <CardContent className="h-64 pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ingestionTrend} margin={{ left: -20, right: 10, top: 10 }}>
              <defs>
                <linearGradient id="ingestionFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(213 55% 20%)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(213 55% 20%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="documents"
                stroke="hsl(213 55% 20%)"
                strokeWidth={2}
                fill="url(#ingestionFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Downtime by Cause</CardTitle>
          <CardDescription>Share of incidents (placeholder data)</CardDescription>
        </CardHeader>
        <CardContent className="h-64 pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={downtimeByCause} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="cause"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                width={100}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="hsl(32 70% 49%)" radius={[0, 4, 4, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-base">Compliance Score Trend</CardTitle>
          <CardDescription>Weekly rolling audit-readiness score (placeholder data)</CardDescription>
        </CardHeader>
        <CardContent className="h-56 pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={complianceScore} margin={{ left: -20, right: 10, top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
              <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} domain={[60, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(152 55% 35%)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}