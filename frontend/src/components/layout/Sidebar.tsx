import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, FileStack, Share2, Bot, Wrench, ShieldCheck, Factory, BarChart3,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/documents", label: "Documents", icon: FileStack },
  { to: "/knowledge-graph", label: "Knowledge Graph", icon: Share2 },
  { to: "/copilot", label: "Expert Copilot", icon: Bot },
  { to: "/maintenance", label: "Maintenance & RCA", icon: Wrench },
  { to: "/compliance", label: "Compliance", icon: ShieldCheck },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Factory className="h-4.5 w-4.5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">Industrial KI</p>
          <p className="text-[11px] text-sidebar-foreground/60">Operations Brain</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-white/10 text-white" : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-white"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 text-[11px] text-sidebar-foreground/50">
        v1.0.0 · All modules integrated
      </div>
    </aside>
  );
}