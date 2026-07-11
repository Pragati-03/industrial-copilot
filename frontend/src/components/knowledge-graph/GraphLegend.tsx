import type { GraphNodeType } from "@/lib/types";
import { NODE_TYPE_CONFIG, NODE_TYPE_ORDER } from "@/components/knowledge-graph/nodeConfig";
import { cn } from "@/lib/utils";

interface GraphLegendProps {
  activeTypes: Set<GraphNodeType>;
  onToggle: (type: GraphNodeType) => void;
}

export function GraphLegend({ activeTypes, onToggle }: GraphLegendProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {NODE_TYPE_ORDER.map((type) => {
        const cfg = NODE_TYPE_CONFIG[type];
        const active = activeTypes.has(type);
        return (
          <button
            key={type}
            onClick={() => onToggle(type)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "border-border bg-card text-foreground"
                : "border-border/60 bg-transparent text-muted-foreground/50"
            )}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: cfg.color, opacity: active ? 1 : 0.4 }}
            />
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}