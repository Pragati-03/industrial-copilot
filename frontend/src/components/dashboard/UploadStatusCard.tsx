import { FileText, CheckCircle2, Loader2, Clock } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { uploads } from "@/lib/dummy-data";

const statusConfig = {
  complete: { label: "Complete", variant: "success" as const, icon: CheckCircle2 },
  processing: { label: "Processing", variant: "accent" as const, icon: Loader2 },
  queued: { label: "Queued", variant: "secondary" as const, icon: Clock },
};

export function UploadStatusCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upload Status</CardTitle>
        <CardDescription>Document ingestion pipeline — live queue</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {uploads.map((u) => {
          const cfg = statusConfig[u.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={u.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm font-medium text-foreground">{u.name}</span>
                </div>
                <Badge variant={cfg.variant} className="shrink-0 gap-1">
                  <StatusIcon className={u.status === "processing" ? "h-3 w-3 animate-spin" : "h-3 w-3"} />
                  {cfg.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={u.progress} className="h-1.5" />
                <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">
                  {u.progress}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{u.size}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}