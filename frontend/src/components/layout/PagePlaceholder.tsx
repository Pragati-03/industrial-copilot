import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PagePlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * Placeholder shown for routes that don't have business logic yet.
 * Confirms routing, layout, and theming are wired up correctly.
 */
export function PagePlaceholder({ icon: Icon, title, description }: PagePlaceholderProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/15 text-accent">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">Module not yet implemented</CardTitle>
            <CardDescription>This screen is scaffolded and ready for Phase 2 logic.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Routing, layout, and theme are configured. Business logic for this module will be
          added in a later build phase.
        </CardContent>
      </Card>
    </div>
  );
}
