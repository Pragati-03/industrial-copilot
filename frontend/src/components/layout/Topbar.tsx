import { Bell, Search, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-secondary/40 px-3 py-1.5 text-sm text-muted-foreground sm:flex sm:max-w-sm">
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">Search assets, documents, procedures…</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Badge variant="success" className="hidden sm:inline-flex">
          All systems operational
        </Badge>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
        </Button>
        <Avatar>
          <AvatarFallback>SR</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}