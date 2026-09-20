import { GraphEdge } from '../types';

export type NeighborhoodDepth = number | 'all';

export interface Neighborhood {
  nodeIds: Set<string>;
  edges: GraphEdge[];
}

// BFS outward from focusId in both directions (outgoing edges = "depends
// on", incoming edges = "used by") up to `depth` hops. The visited set
// itself prevents infinite loops on cycles, so "all" (unbounded depth) is
// safe to pass directly.
export function computeNeighborhood(
  edges: GraphEdge[],
  focusId: string,
  depth: NeighborhoodDepth
): Neighborhood {
  const maxDepth = depth === 'all' ? Infinity : depth;
  const visited = new Set<string>([focusId]);

  let frontier = new Set<string>([focusId]);
  for (let hop = 0; hop < maxDepth && frontier.size > 0; hop++) {
    const nextFrontier = new Set<string>();
    for (const edge of edges) {
      if (frontier.has(edge.from) && !visited.has(edge.to)) {
        nextFrontier.add(edge.to);
      }
      if (frontier.has(edge.to) && !visited.has(edge.from)) {
        nextFrontier.add(edge.from);
      }
    }
    nextFrontier.forEach((id) => visited.add(id));
    frontier = nextFrontier;
  }

  const includedEdges = edges.filter((edge) => visited.has(edge.from) && visited.has(edge.to));
  return { nodeIds: visited, edges: includedEdges };
}
