import { GraphSnapshot, RouteChain } from '../../snapshot/models';
import { GraphQLSnapshot } from '../../snapshot/graphql-models';
import { Issue } from '../models';
import { isNestInternalToken } from '../nest-internal-tokens';

function addChainNames(names: Set<string>, chain: RouteChain): void {
  for (const guard of chain.guards) names.add(guard);
  for (const pipe of chain.pipes) names.add(pipe);
  for (const interceptor of chain.interceptors) names.add(interceptor);
  for (const filter of chain.filters) names.add(filter);
}

// Guards, pipes, interceptors, and filters are commonly applied by class
// reference in a decorator (`@UseGuards(AuthGuard)`) rather than injected
// via a constructor — Nest instantiates them itself as part of the request
// pipeline. Both RouteMeta.chain (REST) and GraphQLOperationMeta.chain
// (GraphQL resolvers, when available) already record these names, so a
// provider referenced in either is in active use even with zero "injects"
// edges (confirmed via manual verification against a real, GraphQL-first
// app: AuthGuard, IdInterceptor, and similar were applied exclusively to
// resolver methods, not REST routes, and were otherwise flagged as unused).
function collectChainReferencedNames(
  snapshot: GraphSnapshot,
  graphqlSnapshot?: GraphQLSnapshot,
): Set<string> {
  const names = new Set<string>();
  for (const route of snapshot.routes) {
    addChainNames(names, route.chain);
  }
  for (const operation of graphqlSnapshot?.operations ?? []) {
    addChainNames(names, operation.chain);
  }
  return names;
}

export function findUnusedProviders(
  snapshot: GraphSnapshot,
  graphqlSnapshot?: GraphQLSnapshot,
): Issue[] {
  const injectedIds = new Set(
    snapshot.edges.filter((edge) => edge.kind === 'injects').map((edge) => edge.to),
  );
  const routeChainNames = collectChainReferencedNames(snapshot, graphqlSnapshot);

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
