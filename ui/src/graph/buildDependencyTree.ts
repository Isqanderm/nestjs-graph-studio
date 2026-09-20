import { GraphNode, GraphEdge, NodeType } from '../types';
import { NeighborhoodDepth } from './neighborhood';

export interface DependencyTreeNode {
  id: string;
  name: string;
  type: NodeType;
  isCycle: boolean;
  children: DependencyTreeNode[];
}

export interface DependencyTree {
  root: { id: string; name: string; type: NodeType };
  dependsOn: DependencyTreeNode[];
  usedBy: DependencyTreeNode[];
}

function buildBranch(
  currentId: string,
  neighborsOf: Map<string, string[]>,
  nodesById: Map<string, GraphNode>,
  depthRemaining: number,
  ancestors: Set<string>
): DependencyTreeNode[] {
  if (depthRemaining <= 0) return [];

  const neighborIds = neighborsOf.get(currentId) ?? [];
  return neighborIds.map((id) => {
    const node = nodesById.get(id);
    const base = { id, name: node?.name ?? id, type: node?.type ?? 'PROVIDER' as NodeType };

    if (ancestors.has(id)) {
      return { ...base, isCycle: true, children: [] };
    }

    const nextAncestors = new Set(ancestors);
    nextAncestors.add(id);
    return {
      ...base,
      isCycle: false,
      children: buildBranch(id, neighborsOf, nodesById, depthRemaining - 1, nextAncestors),
    };
  });
}

export function buildDependencyTree(
  nodes: GraphNode[],
  edges: GraphEdge[],
  focusId: string,
  depth: NeighborhoodDepth
): DependencyTree {
  const maxDepth = depth === 'all' ? Infinity : depth;
  const nodesById = new Map(nodes.map((n) => [n.id, n]));

  const dependsOnOf = new Map<string, string[]>();
  const usedByOf = new Map<string, string[]>();
  for (const edge of edges) {
    if (!dependsOnOf.has(edge.from)) dependsOnOf.set(edge.from, []);
    dependsOnOf.get(edge.from)!.push(edge.to);

    if (!usedByOf.has(edge.to)) usedByOf.set(edge.to, []);
    usedByOf.get(edge.to)!.push(edge.from);
  }

  const focusNode = nodesById.get(focusId);
  const rootAncestors = new Set<string>([focusId]);

  return {
    root: { id: focusId, name: focusNode?.name ?? focusId, type: focusNode?.type ?? 'PROVIDER' },
    dependsOn: buildBranch(focusId, dependsOnOf, nodesById, maxDepth, rootAncestors),
    usedBy: buildBranch(focusId, usedByOf, nodesById, maxDepth, rootAncestors),
  };
}
