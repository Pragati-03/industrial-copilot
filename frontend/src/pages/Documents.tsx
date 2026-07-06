import { FileStack } from "lucide-react";

import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export function Documents() {
  return (
    <PagePlaceholder
      icon={FileStack}
      title="Documents"
      description="Universal ingestion of manuals, SOPs, drawings, and maintenance records."
    />
  );
}
