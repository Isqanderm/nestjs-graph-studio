import { GraphSnapshot, GraphNode } from '../../snapshot/models';
import { Issue } from '../models';
import { isNestInternalToken } from '../nest-internal-tokens';

export function findDuplicateTokens(snapshot: GraphSnapshot): Issue[] {
  const providersByName = new Map<string, GraphNode[]>();

  for (const node of snapshot.nodes) {
    if (node.type !== 'PROVIDER') continue;
    // Entry points (GraphQL resolvers, module self-registration) are
    // expected to appear once per module by design (e.g. Vendure
    // registers each resolver separately for its Admin and Shop GraphQL
    // APIs) — that is not the "two different instances" confusion this
    // check looks for. Nest-internal tokens are excluded for the same
    // reason as in findUnusedProviders.
    if (node.isEntryPoint) continue;
    if (isNestInternalToken(node.name)) continue;
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
