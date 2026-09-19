import { GraphSnapshot } from '../../snapshot/models';
import { Issue } from '../models';
import { isNestInternalToken } from '../nest-internal-tokens';

// Guards, pipes, interceptors, and filters are commonly applied by class
// reference in a decorator (`@UseGuards(AuthGuard)`) rather than injected
// via a constructor — Nest instantiates them itself as part of the request
// pipeline. RouteMeta.chain already records these names per route, so a
// provider referenced there is in active use even with zero "injects"
// edges (confirmed via manual verification against a real app: AuthGuard,
// IdInterceptor, and similar were otherwise flagged as unused).
function collectRouteChainNames(snapshot: GraphSnapshot): Set<string> {
  const names = new Set<string>();
  for (const route of snapshot.routes) {
    for (const guard of route.chain.guards) names.add(guard);
    for (const pipe of route.chain.pipes) names.add(pipe);
    for (const interceptor of route.chain.interceptors) names.add(interceptor);
    for (const filter of route.chain.filters) names.add(filter);
  }
  return names;
}

export function findUnusedProviders(snapshot: GraphSnapshot): Issue[] {
  const injectedIds = new Set(
    snapshot.edges.filter((edge) => edge.kind === 'injects').map((edge) => edge.to),
  );
  const routeChainNames = collectRouteChainNames(snapshot);

  return snapshot.nodes
    .filter((node) => node.type === 'PROVIDER')
    .filter((node) => !injectedIds.has(node.id))
    .filter((node) => !node.isEntryPoint)
    .filter((node) => !isNestInternalToken(node.name))
    .filter((node) => !routeChainNames.has(node.name))
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
