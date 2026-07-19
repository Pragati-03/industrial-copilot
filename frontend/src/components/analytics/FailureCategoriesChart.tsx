import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { failureCategories } from "@/lib/analytics-data";

const tooltipStyle = { borderRadius: 8, border: "1px solid hsl(214 20% 88%)", fontSize: 12 };

const COLORS = ["#C53030", "#D98E2B", "#2B6CB0", "#0F2A44", "#2F855A", "#8C9CAB", "#6B4C9A"];

export function FailureCategoriesChart() {
  const total = failureCategories.reduce((sum, f) => sum + f.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Failure Categories</CardTitle>
        <CardDescription>Distribution of {total} recorded failures by type</CardDescription>
      </CardHeader>
      <CardContent className="h-72 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={failureCategories}
              dataKey="count"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
            >
              {failureCategories.map((entry, index) => (
                <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number, name: string) => [
                `${value} (${((value / total) * 100).toFixed(0)}%)`,
                name,
              ]}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ fontSize: 11, lineHeight: "18px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}