import { Upload, Bot, ShieldAlert, Cpu, Wrench } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { recentActivity } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

const typeConfig = {
  upload: { icon: Upload, className: "bg-primary/10 text-primary" },
  ai: { icon: Bot, className: "bg-accent/15 text-accent" },
  compliance: { icon: ShieldAlert, className: "bg-status-warning/15 text-status-warning" },
  system: { icon: Cpu, className: "bg-secondary text-secondary-foreground" },
  maintenance: { icon: Wrench, className: "bg-status-safe/15 text-status-safe" },
};

export function RecentActivityPanel() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
        <CardDescription>Latest events across ingestion, AI, and compliance</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-1 overflow-y-auto pt-0">
        {recentActivity.map((item) => {
          const cfg = typeConfig[item.type];
          const Icon = cfg.icon;
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-secondary/60"
            >
              <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", cfg.className)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug text-foreground">
                  <span className="font-medium">{item.actor}</span>{" "}
                  <span className="text-muted-foreground">{item.action}</span>{" "}
                  <span className="font-medium">{item.target}</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.time}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}