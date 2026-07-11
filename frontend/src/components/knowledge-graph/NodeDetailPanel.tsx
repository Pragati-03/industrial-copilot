import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { GraphData, GraphNode } from "@/lib/types";
import { NODE_TYPE_CONFIG } from "@/components/knowledge-graph/nodeConfig";

interface NodeDetailPanelProps {
  node: GraphNode;
  data: GraphData;
  onClose: () => void;
}

export function NodeDetailPanel({ node, data, onClose }: NodeDetailPanelProps) {
  const cfg = NODE_TYPE_CONFIG[node.type];

  const connections = data.edges
    .filter((e) => e.source === node.id || e.target === node.id)
    .map((e) => {
      const otherId = e.source === node.id ? e.target : e.source;
      const other = data.nodes.find((n) => n.id === otherId);
      const direction = e.source === node.id ? "→" : "←";
      return { edge: e, other, direction };
    })
    .filter((c) => c.other);

  return (
    <div className="absolute right-4 top-4 w-72 rounded-lg border border-border bg-card p-4 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
            style={{ backgroundColor: `${cfg.color}22`, color: cfg.color }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
            {cfg.label}
          </span>
          <p className="mt-1.5 text-sm font-semibold text-foreground">{node.label}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <p className="mt-3 text-xs font-medium text-muted-foreground">
        {connections.length} connection{connections.length === 1 ? "" : "s"}
      </p>
      <div className="mt-1.5 max-h-64 space-y-1 overflow-y-auto">
        {connections.map(({ edge, other, direction }, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs hover:bg-secondary/60"
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: NODE_TYPE_CONFIG[other!.type].color }}
            />
            <span className="shrink-0 text-muted-foreground">{edge.relation}</span>
            <span className="shrink-0 text-muted-foreground">{direction}</span>
            <span className="truncate font-medium text-foreground">{other!.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}