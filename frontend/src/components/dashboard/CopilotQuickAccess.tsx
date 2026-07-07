import { Bot, Send, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { copilotSuggestions } from "@/lib/dummy-data";

export function CopilotQuickAccess() {
  return (
    <Card className="overflow-hidden border-primary/20 bg-primary text-primary-foreground">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base text-primary-foreground">AI Expert Copilot</CardTitle>
            <CardDescription className="text-primary-foreground/70">
              Ask anything about your plant documents
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2">
          <Sparkles className="h-4 w-4 shrink-0 text-accent" />
          <input
            disabled
            placeholder="e.g. Why did Compressor C-12 fail last quarter?"
            className="w-full bg-transparent text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none"
          />
          <Button size="icon" variant="secondary" className="h-7 w-7 shrink-0">
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {copilotSuggestions.map((s) => (
            <span
              key={s}
              className="cursor-default rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-primary-foreground/80"
            >
              {s}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}