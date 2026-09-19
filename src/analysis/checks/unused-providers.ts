import { GraphSnapshot } from '../../snapshot/models';
import { Issue } from '../models';
import { isNestInternalToken } from '../nest-internal-tokens';

export function findUnusedProviders(snapshot: GraphSnapshot): Issue[] {
  const injectedIds = new Set(
    snapshot.edges.filter((edge) => edge.kind === 'injects').map((edge) => edge.to),
  );

  return snapshot.nodes
    .filter((node) => node.type === 'PROVIDER')
    .filter((node) => !injectedIds.has(node.id))
    .filter((node) => !node.isEntryPoint)
    .filter((node) => !isNestInternalToken(node.name))
    .map((node) => ({
      id: `unused-provider:${node.id}`,
      category: 'unused-provider' as const,
      severity: 'warning' as const,
      title: `Unused provider: ${node.name}`,
      description: `"${node.name}" in ${node.module ?? 'an unknown module'} is registered as a provider but is never injected anywhere in the application.`,
      nodeIds: [node.id],
      suggestedFix:
        'Remove this provider if it is dead code, or verify it should be injected/exported somewhere.',
    }));
}
