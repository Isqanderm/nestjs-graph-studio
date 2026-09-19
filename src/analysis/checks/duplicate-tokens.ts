import { GraphSnapshot, GraphNode } from '../../snapshot/models';
import { Issue } from '../models';

export function findDuplicateTokens(snapshot: GraphSnapshot): Issue[] {
  const providersByName = new Map<string, GraphNode[]>();

  for (const node of snapshot.nodes) {
    if (node.type !== 'PROVIDER') continue;
    if (!providersByName.has(node.name)) {
      providersByName.set(node.name, []);
    }
    providersByName.get(node.name)!.push(node);
  }

  const issues: Issue[] = [];

  for (const [name, nodes] of providersByName.entries()) {
    const distinctModules = new Set(nodes.map((node) => node.module ?? 'unknown'));
    if (distinctModules.size < 2) continue;

    issues.push({
      id: `duplicate-token:${name}`,
      category: 'duplicate-token',
      severity: 'warning',
      title: `Token registered in multiple modules: ${name}`,
      description: `"${name}" is provided independently in ${distinctModules.size} modules (${Array.from(
        distinctModules,
      ).join(', ')}). Module-scoped tokens are independent by default in Nest, so each module gets its own instance — this is a common source of "two different instances" confusion unless intentional.`,
      nodeIds: nodes.map((node) => node.id),
      suggestedFix:
        'If a single shared instance is intended, move the provider into one module and export/import it; otherwise this may be fine as-is.',
    });
  }

  return issues;
}
