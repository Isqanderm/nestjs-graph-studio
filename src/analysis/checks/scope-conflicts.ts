import { GraphSnapshot, GraphNode } from '../../snapshot/models';
import { Issue } from '../models';

export function findScopeConflicts(snapshot: GraphSnapshot): Issue[] {
  const nodeById = new Map<string, GraphNode>(snapshot.nodes.map((node) => [node.id, node]));

  const injectsBySource = new Map<string, string[]>();
  for (const edge of snapshot.edges) {
    if (edge.kind !== 'injects') continue;
    if (!injectsBySource.has(edge.from)) {
      injectsBySource.set(edge.from, []);
    }
    injectsBySource.get(edge.from)!.push(edge.to);
  }

  function dependsOnRequestScoped(nodeId: string, visited: Set<string>): string | null {
    if (visited.has(nodeId)) return null;
    visited.add(nodeId);

    for (const depId of injectsBySource.get(nodeId) || []) {
      const dep = nodeById.get(depId);
      if (dep?.scope === 'REQUEST') {
        return depId;
      }
      const transitive = dependsOnRequestScoped(depId, visited);
      if (transitive) return transitive;
    }
    return null;
  }

  const issues: Issue[] = [];

  for (const node of snapshot.nodes) {
    if (node.type !== 'PROVIDER') continue;
    if (node.scope === 'REQUEST' || node.scope === 'TRANSIENT') continue;

    const requestScopedDepId = dependsOnRequestScoped(node.id, new Set<string>());
    if (requestScopedDepId) {
      const depNode = nodeById.get(requestScopedDepId);
      issues.push({
        id: `scope-conflict:${node.id}`,
        category: 'scope-conflict',
        severity: 'warning',
        title: `Implicit request scope: ${node.name}`,
        description: `"${node.name}" is declared as SINGLETON but depends (directly or transitively) on "${
          depNode?.name ?? requestScopedDepId
        }", which is REQUEST-scoped. Nest will silently promote "${node.name}" to request scope, meaning it will be instantiated on every request instead of once.`,
        nodeIds: [node.id, requestScopedDepId],
        suggestedFix: `Either mark "${node.name}" as REQUEST-scoped explicitly to make this intentional, or remove the dependency on "${
          depNode?.name ?? requestScopedDepId
        }" if the per-request behavior is unwanted.`,
      });
    }
  }

  return issues;
}
