import { ShieldCheck } from "lucide-react";

import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export function Compliance() {
  return (
    <PagePlaceholder
      icon={ShieldCheck}
      title="Compliance"
      description="Regulatory cross-referencing, audit readiness, and gap detection."
    />
  );
}
