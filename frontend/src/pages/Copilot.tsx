import { Bot } from "lucide-react";

import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export function Copilot() {
  return (
    <PagePlaceholder
      icon={Bot}
      title="Expert Copilot"
      description="Ask questions in plain language and get answers grounded in plant documents."
    />
  );
}
