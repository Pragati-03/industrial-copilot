import { useState } from "react";
import { RefreshCw, Share2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraphCanvas } from "@/components/knowledge-graph/GraphCanvas";
import { GraphLegend } from "@/components/knowledge-graph/GraphLegend";
import { NodeDetailPanel } from "@/components/knowledge-graph/NodeDetailPanel";
import { NODE_TYPE_ORDER } from "@/components/knowledge-graph/nodeConfig";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { EmptyState } from "@/components/shared/EmptyState";
import { useFetch } from "@/hooks/useFetch";
import { fetchKnowledgeGraph } from "@/lib/api";
import type { GraphNode, GraphNodeType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function KnowledgeGraph() {
  const { data, loading, error, reload } = useFetch(
    () => fetchKnowledgeGraph(),
    [],
    "Could not load the knowledge graph. Is the backend running?"
  );

  const [activeTypes, setActiveTypes] = useState<Set<GraphNodeType>>(new Set(NODE_TYPE_ORDER));
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  function toggleType(type: GraphNodeType) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Knowledge Graph</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Equipment, engineers, dates, maintenance events, and failure types extracted from your
            documents, connected by co-occurrence.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reload} disabled={loading} className="gap-1.5">
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {error && <ErrorBanner message={error} onRetry={reload} />}

      {data && (
        <div className="flex items-center justify-between gap-4">
          <GraphLegend activeTypes={activeTypes} onToggle={toggleType} />
          <p className="shrink-0 text-xs text-muted-foreground">
            {data.stats.node_count} nodes · {data.stats.edge_count} edges
          </p>
        </div>
      )}

      <Card className="relative flex-1 overflow-hidden">
        <CardContent className="h-full p-0">
          {loading && !data && <LoadingState message="Loading graph…" />}

          {data && data.nodes.length === 0 && (
            <EmptyState icon={Share2} message="No entities found yet. Upload and OCR a document to populate the graph." />
          )}

          {data && data.nodes.length > 0 && (
            <GraphCanvas data={data} activeTypes={activeTypes} onNodeSelect={setSelectedNode} />
          )}

          {selectedNode && data && (
            <NodeDetailPanel node={selectedNode} data={data} onClose={() => setSelectedNode(null)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}