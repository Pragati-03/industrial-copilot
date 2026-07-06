import { Wrench } from "lucide-react";

import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export function Maintenance() {
  return (
    <PagePlaceholder
      icon={Wrench}
      title="Maintenance & RCA"
      description="Equipment history, root-cause analysis, and failure pattern detection."
    />
  );
}
