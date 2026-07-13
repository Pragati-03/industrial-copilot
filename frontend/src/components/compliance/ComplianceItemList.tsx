import { CheckCircle2, FileText, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { severityMeta } from "@/components/maintenance/severity";
import type { ComplianceItem } from "@/lib/types";

interface ComplianceItemListProps {
  title: string;
  description: string;
  items: ComplianceItem[];
  variant: "missing" | "compliant";
}

export function ComplianceItemList({ title, description, items, variant }: ComplianceItemListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {title} ({items.length})
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {variant === "missing"
              ? "No gaps found against the checked categories."
              : "No matching procedures found yet."}
          </p>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => {
              const meta = severityMeta(item.risk_level);
              return (
                <div key={item.rule_id} className="flex items-start gap-3 py-3">
                  {variant === "missing" ? (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-status-critical" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-safe" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{item.category}</p>
                      {variant === "missing" && (
                        <Badge variant={meta.badgeVariant}>{item.risk_level}</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>

                    {variant === "compliant" && item.matches.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {item.matches.map((m, idx) => (
                          <span
                            key={idx}
                            className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground"
                            title={m.snippet}
                          >
                            <FileText className="h-3 w-3" />
                            {m.filename}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}