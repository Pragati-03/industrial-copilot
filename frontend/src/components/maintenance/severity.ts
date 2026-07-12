import type { SeverityLevel } from "@/lib/types";

interface SeverityMeta {
  badgeVariant: "critical" | "warning" | "accent" | "success";
  dotColor: string;
}

const SEVERITY_META: Record<SeverityLevel, SeverityMeta> = {
  Critical: { badgeVariant: "critical", dotColor: "#C53030" },
  High: { badgeVariant: "warning", dotColor: "#D98E2B" },
  Medium: { badgeVariant: "accent", dotColor: "#D98E2B" },
  Low: { badgeVariant: "success", dotColor: "#2F855A" },
};

export function severityMeta(severity: SeverityLevel): SeverityMeta {
  return SEVERITY_META[severity] ?? SEVERITY_META.Medium;
}

export const SEVERITY_ORDER: SeverityLevel[] = ["Critical", "High", "Medium", "Low"];