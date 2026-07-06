import { Share2 } from "lucide-react";

import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export function KnowledgeGraph() {
  return (
    <PagePlaceholder
      icon={Share2}
      title="Knowledge Graph"
      description="Explore connected entities: equipment, procedures, failures, and fixes."
    />
  );
}
