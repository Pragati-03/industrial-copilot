import { useEffect, useRef, useState } from "react";
import { Bot, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ChatBubble } from "@/components/copilot/ChatBubble";
import { ChatInput } from "@/components/copilot/ChatInput";
import { LoadingState } from "@/components/shared/LoadingState";
import { askCopilot } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

const STARTER_QUESTIONS = [
  "What safety procedures are documented?",
  "Summarize the most recent maintenance activity",
  "What equipment has recurring failures?",
];

export function Copilot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function handleSend(question: string) {
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setSending(true);

    try {
      const result = await askCopilot(question);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: result.answer, sources: result.sources },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: err instanceof Error ? err.message : "Something went wrong. Please try again.",
          isError: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Expert Copilot</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask questions in plain language and get answers grounded in your uploaded documents.
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Ask your first question</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Answers are grounded in your uploaded documents, with citations.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-secondary"
                  >
                    <Sparkles className="h-3 w-3 text-accent" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <ChatBubble key={m.id} message={m} />
          ))}

          {sending && <LoadingState message="Thinking…" className="h-auto justify-start" />}
        </div>

        <ChatInput onSend={handleSend} disabled={sending} />
      </Card>
    </div>
  );
}