import { VenueGraph, VenueEdge, VenueNode } from '../types/index.js';

export function buildGraph(venue: VenueGraph) {
  const adj = new Map<string, { to: string; edge: VenueEdge }[]>();
  for (const node of venue.nodes) adj.set(node.id, []);
  for (const edge of venue.edges) {
    adj.get(edge.from)?.push({ to: edge.to, edge });
    if (edge.bidirectional) adj.get(edge.to)?.push({ to: edge.from, edge });
  }
  return adj;
}

export function findShortestPath(venue: VenueGraph, start: string, end: string): string[] {
  const adj = buildGraph(venue);
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();
  for (const node of venue.nodes) { dist.set(node.id, Infinity); prev.set(node.id, null); }
  dist.set(start, 0);
  while (visited.size < venue.nodes.length) {
    let u: string | null = null; let minDist = Infinity;
    for (const [nodeId, d] of dist) {
      if (!visited.has(nodeId) && d < minDist) { minDist = d; u = nodeId; }
    }
    if (u === null || u === end) break;
    visited.add(u);
    for (const { to, edge } of adj.get(u) ?? []) {
      const alt = (dist.get(u) ?? Infinity) + edge.length;
      if (alt < (dist.get(to) ?? Infinity)) { dist.set(to, alt); prev.set(to, u); }
    }
  }
  const path: string[] = [];
  let curr: string | null = end;
  while (curr !== null) { path.unshift(curr); curr = prev.get(curr) ?? null; }
  return path[0] === start ? path : [];
}

export function findPathAvoidingEdge(venue: VenueGraph, start: string, end: string, avoidEdgeId: string): string[] {
  const filtered: VenueGraph = { nodes: venue.nodes, edges: venue.edges.filter((e) => e.id !== avoidEdgeId) };
  return findShortestPath(filtered, start, end);
}

export function getEdgeBetween(venue: VenueGraph, from: string, to: string): VenueEdge | undefined {
  return venue.edges.find((e) => (e.from === from && e.to === to) || (e.bidirectional && e.from === to && e.to === from));
}

export function getNodeById(venue: VenueGraph, id: string): VenueNode | undefined {
  return venue.nodes.find((n) => n.id === id);
}
