import { Bot, FileText, User } from "lucide-react";

import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-accent/15 text-accent"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={cn("flex max-w-[75%] flex-col gap-2", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-lg px-3.5 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground"
              : message.isError
                ? "border border-status-critical/30 bg-status-critical/10 text-status-critical"
                : "bg-secondary text-foreground"
          )}
        >
          {message.content}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="flex w-full flex-col gap-1.5">
            <p className="text-[11px] font-medium text-muted-foreground">Sources</p>
            {message.sources.map((source, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 rounded-md border border-border bg-card px-2.5 py-2 text-xs"
              >
                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {source.filename}
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      · chunk {source.chunk_index}
                    </span>
                  </p>
                  <p className="mt-0.5 text-muted-foreground">{source.snippet}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}