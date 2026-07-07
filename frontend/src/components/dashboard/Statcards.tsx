import { FileStack, Factory, ShieldAlert, Bot, ArrowUpRight, ArrowDownRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { statCards } from "@/lib/dummy-data";

const iconMap = { FileStack, Factory, ShieldAlert, Bot };

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = iconMap[stat.icon];
        const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight;
        const trendColor =
          stat.trend === "up" ? "text-status-safe" : "text-status-critical";

        return (
          <Card key={stat.label}>
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${trendColor}`}>
                  <TrendIcon className="h-3.5 w-3.5" />
                  {stat.delta}
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}