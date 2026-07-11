import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Share2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraphCanvas } from "@/components/knowledge-graph/GraphCanvas";
import { GraphLegend } from "@/components/knowledge-graph/GraphLegend";
import { NodeDetailPanel } from "@/components/knowledge-graph/NodeDetailPanel";
import { NODE_TYPE_ORDER } from "@/components/knowledge-graph/nodeConfig";
import { fetchKnowledgeGraph } from "@/lib/api";
import type { GraphData, GraphNode, GraphNodeType } from "@/lib/types";

export function KnowledgeGraph() {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTypes, setActiveTypes] = useState<Set<GraphNodeType>>(
    new Set(NODE_TYPE_ORDER)
  );
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const graph = await fetchKnowledgeGraph();
      setData(graph);
      setError(null);
    } catch {
      setError("Could not load the knowledge graph. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function toggleType(type: GraphNodeType) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Knowledge Graph
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Equipment, engineers, dates, maintenance events, and failure types extracted from
            your documents, connected by co-occurrence.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
          <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
          Refresh
        </Button>
      </div>

      {error && (
        <p className="rounded-md border border-status-critical/30 bg-status-critical/10 px-3 py-2 text-sm text-status-critical">
          {error}
        </p>
      )}

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
          {loading && !data && (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Loading graph…
            </div>
          )}

          {data && data.nodes.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <Share2 className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No entities found yet. Upload and OCR a document to populate the graph.
              </p>
            </div>
          )}

          {data && data.nodes.length > 0 && (
            <GraphCanvas data={data} activeTypes={activeTypes} onNodeSelect={setSelectedNode} />
          )}

          {selectedNode && data && (
            <NodeDetailPanel
              node={selectedNode}
              data={data}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}