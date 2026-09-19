import { GraphSnapshot } from '../../snapshot/models';
import { Issue } from '../models';

function buildAdjacency(
  snapshot: GraphSnapshot,
  kind: 'import' | 'injects',
): Map<string, string[]> {
  const adjacency = new Map<string, string[]>();
  for (const edge of snapshot.edges) {
    if (edge.kind !== kind) continue;
    if (!adjacency.has(edge.from)) {
      adjacency.set(edge.from, []);
    }
    adjacency.get(edge.from)!.push(edge.to);
  }
  return adjacency;
}

function normalizeCycle(cycle: string[]): string {
  let minIndex = 0;
  for (let i = 1; i < cycle.length; i++) {
    if (cycle[i] < cycle[minIndex]) {
      minIndex = i;
    }
  }
  return [...cycle.slice(minIndex), ...cycle.slice(0, minIndex)].join('->');
}

function findCycles(adjacency: Map<string, string[]>): string[][] {
  const visited = new Set<string>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const cycles: string[][] = [];
  const seenSignatures = new Set<string>();

  function visit(nodeId: string): void {
    visited.add(nodeId);
    onStack.add(nodeId);
    stack.push(nodeId);

    for (const next of adjacency.get(nodeId) || []) {
      if (!visited.has(next)) {
        visit(next);
      } else if (onStack.has(next)) {
        const cycleStart = stack.indexOf(next);
        const cycle = stack.slice(cycleStart);
        const signature = normalizeCycle(cycle);
        if (!seenSignatures.has(signature)) {
          seenSignatures.add(signature);
          cycles.push(cycle);
        }
      }
    }

    stack.pop();
    onStack.delete(nodeId);
  }

  for (const nodeId of adjacency.keys()) {
    if (!visited.has(nodeId)) {
      visit(nodeId);
    }
  }

  return cycles;
}

function cycleToIssue(
  nodeNameById: Map<string, string>,
  cycle: string[],
  scope: 'module' | 'provider',
): Issue {
  const names = cycle.map((id) => nodeNameById.get(id) || id);
  const pathDescription = [...names, names[0]].join(' -> ');

  return {
    id: `circular-dependency:${scope}:${[...cycle].sort().join(',')}`,
    category: 'circular-dependency',
    severity: 'warning',
    title:
      scope === 'module'
        ? `Circular module import: ${names[0]}`
        : `Circular dependency injection: ${names[0]}`,
    description:
      scope === 'module'
        ? `These modules import each other in a cycle: ${pathDescription}. This only works because forwardRef() is used somewhere in the cycle, which makes module initialization order implicit and harder to reason about.`
        : `These providers inject each other in a cycle: ${pathDescription}. This only works because forwardRef() is used somewhere in the cycle — otherwise Nest could not have resolved these dependencies at bootstrap.`,
    nodeIds: cycle,
    suggestedFix:
      scope === 'module'
        ? 'Consider extracting the shared contract into a separate module both sides can import without a cycle.'
        : 'Consider extracting the shared behavior into a separate provider, or using event-based communication instead of direct injection.',
  };
}

export function findCircularDependencies(snapshot: GraphSnapshot): Issue[] {
  const nodeNameById = new Map(snapshot.nodes.map((node) => [node.id, node.name]));

  const moduleCycles = findCycles(buildAdjacency(snapshot, 'import'));
  const providerCycles = findCycles(buildAdjacency(snapshot, 'injects'));

  return [
    ...moduleCycles.map((cycle) => cycleToIssue(nodeNameById, cycle, 'module')),
    ...providerCycles.map((cycle) => cycleToIssue(nodeNameById, cycle, 'provider')),
  ];
}
