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

function findStronglyConnectedComponents(adjacency: Map<string, string[]>): string[][] {
  const indices = new Map<string, number>();
  const lowlink = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  let index = 0;
  const components: string[][] = [];

  function strongconnect(v: string): void {
    indices.set(v, index);
    lowlink.set(v, index);
    index++;
    stack.push(v);
    onStack.add(v);

    for (const w of adjacency.get(v) || []) {
      if (!indices.has(w)) {
        strongconnect(w);
        lowlink.set(v, Math.min(lowlink.get(v)!, lowlink.get(w)!));
      } else if (onStack.has(w)) {
        lowlink.set(v, Math.min(lowlink.get(v)!, indices.get(w)!));
      }
    }

    if (lowlink.get(v) === indices.get(v)) {
      const component: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        component.push(w);
      } while (w !== v);
      components.push(component);
    }
  }

  for (const v of adjacency.keys()) {
    if (!indices.has(v)) {
      strongconnect(v);
    }
  }

  return components.filter((component) => component.length > 1);
}

function cycleToIssue(
  nodeNameById: Map<string, string>,
  component: string[],
  scope: 'module' | 'provider',
): Issue {
  const names = component.map((id) => nodeNameById.get(id) || id).sort();
  const primaryName = names[0];

  return {
    id: `circular-dependency:${scope}:${[...component].sort().join(',')}`,
    category: 'circular-dependency',
    severity: 'warning',
    title:
      scope === 'module'
        ? `Circular module import: ${primaryName}`
        : `Circular dependency injection: ${primaryName}`,
    description:
      scope === 'module'
        ? `These modules form a circular dependency: ${names.join(', ')}. This only works because forwardRef() is used somewhere in the cycle, which makes module initialization order implicit and harder to reason about.`
        : `These providers form a circular dependency: ${names.join(', ')}. This only works because forwardRef() is used somewhere in the cycle — otherwise Nest could not have resolved these dependencies at bootstrap.`,
    nodeIds: component,
    suggestedFix:
      scope === 'module'
        ? 'Consider extracting the shared contract into a separate module both sides can import without a cycle.'
        : 'Consider extracting the shared behavior into a separate provider, or using event-based communication instead of direct injection.',
  };
}

export function findCircularDependencies(snapshot: GraphSnapshot): Issue[] {
  const nodeNameById = new Map(snapshot.nodes.map((node) => [node.id, node.name]));

  const moduleComponents = findStronglyConnectedComponents(buildAdjacency(snapshot, 'import'));
  const providerComponents = findStronglyConnectedComponents(buildAdjacency(snapshot, 'injects'));

  return [
    ...moduleComponents.map((component) => cycleToIssue(nodeNameById, component, 'module')),
    ...providerComponents.map((component) => cycleToIssue(nodeNameById, component, 'provider')),
  ];
}
