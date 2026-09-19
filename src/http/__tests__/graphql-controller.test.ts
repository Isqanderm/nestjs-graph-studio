import { describe, it, expect, vi } from 'vitest';
import { GraphQlStudioController } from '../graphql-controller';
import { GraphQLOperationCollector } from '../../snapshot/graphql-collector';
import { GraphQLSnapshot } from '../../snapshot/graphql-models';

describe('GraphQlStudioController', () => {
  it('returns the snapshot produced by GraphQLOperationCollector', () => {
    const mockSnapshot: GraphQLSnapshot = {
      createdAt: new Date().toISOString(),
      stats: { resolverClasses: 1, queries: 1, mutations: 0, subscriptions: 0, fields: 0 },
      operations: [
        {
          kind: 'QUERY',
          typeName: 'Query',
          fieldName: 'products',
          resolverClass: 'ProductResolver',
          methodName: 'products',
          chain: { guards: [], pipes: [], interceptors: [], filters: [] },
        },
      ],
    };
    const mockCollector = {
      collect: vi.fn(() => mockSnapshot),
    } as unknown as GraphQLOperationCollector;

    const controller = new GraphQlStudioController(mockCollector);

    expect(controller.getOperations()).toBe(mockSnapshot);
    expect(mockCollector.collect).toHaveBeenCalledTimes(1);
  });
});
