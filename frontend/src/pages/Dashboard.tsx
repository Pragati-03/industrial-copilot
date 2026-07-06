import { LayoutDashboard } from "lucide-react";

import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export function Dashboard() {
  return (
    <PagePlaceholder
      icon={LayoutDashboard}
      title="Dashboard"
      description="Unified overview of plant assets, open documents, and active alerts."
    />
  );
}
