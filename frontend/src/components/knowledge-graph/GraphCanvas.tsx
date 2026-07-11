import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

import type { GraphData, GraphNode, GraphNodeType } from "@/lib/types";
import { NODE_TYPE_CONFIG } from "@/components/knowledge-graph/nodeConfig";

interface SimNode extends GraphNode, d3.SimulationNodeDatum {}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  relation: string;
  weight: number;
  document_id?: number;
}

interface GraphCanvasProps {
  data: GraphData;
  activeTypes: Set<GraphNodeType>;
  onNodeSelect?: (node: GraphNode | null) => void;
}

function truncate(label: string, max = 18): string {
  return label.length > max ? label.slice(0, max - 1) + "…" : label;
}

export function GraphCanvas({ data, activeTypes, onNodeSelect }: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || size.width === 0) return;

    const filteredNodes: SimNode[] = data.nodes
      .filter((n) => activeTypes.has(n.type))
      .map((n) => ({ ...n }));
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredLinks: SimLink[] = data.edges
      .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map((e) => ({ ...e }));

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = size;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const zoomLayer = svg.append("g");

    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.25, 3])
        .on("zoom", (event) => {
          zoomLayer.attr("transform", event.transform);
        })
    );

    svg
      .append("defs")
      .append("marker")
      .attr("id", "kg-arrow")
      .attr("viewBox", "0 -4 8 8")
      .attr("refX", 16)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-4L8,0L0,4")
      .attr("fill", "#B8C2CC");

    const linkSelection = zoomLayer
      .append("g")
      .attr("stroke", "#C7CFD6")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(filteredLinks)
      .join("line")
      .attr("stroke-width", (d) => Math.min(1 + d.weight * 0.6, 5))
      .attr("marker-end", "url(#kg-arrow)");

    const nodeGroup = zoomLayer.append("g");

    const nodeSelection = nodeGroup
      .selectAll<SVGGElement, SimNode>("g.node")
      .data(filteredNodes, (d) => d.id)
      .join("g")
      .attr("class", "node")
      .style("cursor", "pointer");

    nodeSelection
      .append("circle")
      .attr("r", (d) => NODE_TYPE_CONFIG[d.type].radius)
      .attr("fill", (d) => NODE_TYPE_CONFIG[d.type].color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    nodeSelection
      .append("text")
      .text((d) => truncate(d.label))
      .attr("x", (d) => NODE_TYPE_CONFIG[d.type].radius + 4)
      .attr("y", 3)
      .attr("font-size", 10)
      .attr("fill", "#1C2B3A")
      .attr("paint-order", "stroke")
      .attr("stroke", "#F5F7FA")
      .attr("stroke-width", 3);

    nodeSelection.append("title").text((d) => `${NODE_TYPE_CONFIG[d.type].label}: ${d.label}`);

    function highlight(node: SimNode | null) {
      if (!node) {
        nodeSelection.attr("opacity", 1);
        linkSelection.attr("opacity", 0.6);
        return;
      }
      const connected = new Set<string>([node.id]);
      filteredLinks.forEach((l) => {
        const s = typeof l.source === "string" ? l.source : (l.source as SimNode).id;
        const t = typeof l.target === "string" ? l.target : (l.target as SimNode).id;
        if (s === node.id) connected.add(t);
        if (t === node.id) connected.add(s);
      });
      nodeSelection.attr("opacity", (d) => (connected.has(d.id) ? 1 : 0.15));
      linkSelection.attr("opacity", (l) => {
        const s = typeof l.source === "string" ? l.source : (l.source as SimNode).id;
        const t = typeof l.target === "string" ? l.target : (l.target as SimNode).id;
        return s === node.id || t === node.id ? 0.9 : 0.05;
      });
    }

    nodeSelection
      .on("mouseenter", (_event, d) => highlight(d))
      .on("mouseleave", () => highlight(null))
      .on("click", (_event, d) => onNodeSelect?.(d));

    svg.on("click", (event) => {
      if (event.target === svgRef.current) onNodeSelect?.(null);
    });

    const simulation = d3
      .forceSimulation(filteredNodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(filteredLinks)
          .id((d) => d.id)
          .distance(70)
          .strength(0.4)
      )
      .force("charge", d3.forceManyBody().strength(-180))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collide",
        d3.forceCollide<SimNode>((d) => NODE_TYPE_CONFIG[d.type].radius + 14)
      );

    simulation.on("tick", () => {
      linkSelection
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0);

      nodeSelection.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    const drag = d3
      .drag<SVGGElement, SimNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeSelection.call(drag);

    return () => {
      simulation.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, activeTypes, size]);

  return (
    <div ref={containerRef} className="h-full w-full">
      <svg ref={svgRef} className="h-full w-full" />
    </div>
  );
}