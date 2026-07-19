import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { documentsUploadedTrend } from "@/lib/analytics-data";

const tooltipStyle = { borderRadius: 8, border: "1px solid hsl(214 20% 88%)", fontSize: 12 };

const SERIES = [
  { key: "pdf", name: "PDF", color: "#0F2A44" },
  { key: "docx", name: "DOCX", color: "#2B6CB0" },
  { key: "image", name: "Image", color: "#D98E2B" },
  { key: "txt", name: "TXT", color: "#8C9CAB" },
];

export function DocumentsUploadedChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Documents Uploaded</CardTitle>
        <CardDescription>Monthly ingestion volume by file type, last 8 months</CardDescription>
      </CardHeader>
      <CardContent className="h-72 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={documentsUploadedTrend} margin={{ left: -20, right: 10, top: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {SERIES.map((s) => (
              <Bar key={s.key} dataKey={s.key} name={s.name} stackId="docs" fill={s.color} radius={0} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}