import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Loading…", className }: LoadingStateProps) {
  return (
    <div className={`flex h-40 flex-col items-center justify-center gap-2 text-sm text-muted-foreground ${className ?? ""}`}>
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      {message}
    </div>
  );
}