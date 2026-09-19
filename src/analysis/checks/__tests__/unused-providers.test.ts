import { describe, it, expect } from 'vitest';
import { findUnusedProviders } from '../unused-providers';
import { buildSnapshot, moduleNode, providerNode, controllerNode, edge, routeMeta } from '../../__tests__/fixtures';

describe('findUnusedProviders', () => {
  it('flags a provider with no incoming injects edges', () => {
    const snapshot = buildSnapshot(
      [moduleNode('AppModule'), providerNode('OrphanService', 'AppModule')],
      [],
    );

    const issues = findUnusedProviders(snapshot);

    expect(issues).toHaveLength(1);
    expect(issues[0].category).toBe('unused-provider');
    expect(issues[0].severity).toBe('warning');
    expect(issues[0].nodeIds).toEqual(['provider:AppModule:OrphanService']);
  });

  it('does not flag a provider that is injected elsewhere', () => {
    const snapshot = buildSnapshot(
      [
        controllerNode('UsersController', 'AppModule'),
        providerNode('UsersService', 'AppModule'),
      ],
      [edge('controller:AppModule:UsersController', 'provider:AppModule:UsersService', 'injects')],
    );

    expect(findUnusedProviders(snapshot)).toEqual([]);
  });

  it('does not flag well-known Nest integration tokens', () => {
    const snapshot = buildSnapshot(
      [providerNode('APP_GUARD', 'AppModule'), providerNode('APP_INTERCEPTOR', 'AppModule')],
      [],
    );

    expect(findUnusedProviders(snapshot)).toEqual([]);
  });

  it('does not flag non-provider nodes', () => {
    const snapshot = buildSnapshot(
      [moduleNode('AppModule'), controllerNode('UsersController', 'AppModule')],
      [],
    );

    expect(findUnusedProviders(snapshot)).toEqual([]);
  });

  it('does not flag entry-point providers (GraphQL resolvers, module self-registration)', () => {
    const snapshot = buildSnapshot(
      [
        providerNode('ProductResolver', 'ApiModule', 'SINGLETON', true),
        providerNode('AppModule', 'AppModule', 'SINGLETON', true),
      ],
      [],
    );

    expect(findUnusedProviders(snapshot)).toEqual([]);
  });

  it('does not flag wider Nest DI internals (ModuleRef, Reflector, REQUEST, INQUIRER, plugin option symbols)', () => {
    const snapshot = buildSnapshot(
      [
        providerNode('ModuleRef', 'AppModule'),
        providerNode('Reflector', 'AppModule'),
        providerNode('REQUEST', 'AppModule'),
        providerNode('INQUIRER', 'AppModule'),
        providerNode('Symbol(DEFAULT_SCHEDULER_PLUGIN_OPTIONS)', 'SchedulerPlugin'),
      ],
      [],
    );

    expect(findUnusedProviders(snapshot)).toEqual([]);
  });

  it('does not flag a provider referenced only as a guard/pipe/interceptor/filter in a route chain', () => {
    const snapshot = buildSnapshot(
      [
        providerNode('AuthGuard', 'AppModule'),
        providerNode('ValidationPipe', 'AppModule'),
        providerNode('LoggingInterceptor', 'AppModule'),
        providerNode('ExceptionFilter', 'AppModule'),
      ],
      [],
      [
        routeMeta({
          guards: ['AuthGuard'],
          pipes: ['ValidationPipe'],
          interceptors: ['LoggingInterceptor'],
          filters: ['ExceptionFilter'],
        }),
      ],
    );

    expect(findUnusedProviders(snapshot)).toEqual([]);
  });

  it('still flags a provider that is not referenced in any route chain', () => {
    const snapshot = buildSnapshot(
      [providerNode('AuthGuard', 'AppModule'), providerNode('OrphanService', 'AppModule')],
      [],
      [routeMeta({ guards: ['AuthGuard'] })],
    );

    const issues = findUnusedProviders(snapshot);

    expect(issues).toHaveLength(1);
    expect(issues[0].nodeIds).toEqual(['provider:AppModule:OrphanService']);
  });

  it('does not flag a provider referenced only in a GraphQL resolver chain (e.g. @UseGuards on a resolver method)', () => {
    const snapshot = buildSnapshot(
      [providerNode('AuthGuard', 'ApiModule')],
      [],
      [],
    );
    const graphqlSnapshot = {
      createdAt: new Date().toISOString(),
      stats: { resolverClasses: 1, queries: 1, mutations: 0, subscriptions: 0, fields: 0 },
      operations: [
        {
          kind: 'QUERY' as const,
          typeName: 'Query',
          fieldName: 'products',
          resolverClass: 'ProductResolver',
          methodName: 'products',
          chain: { guards: ['AuthGuard'], pipes: [], interceptors: [], filters: [] },
        },
      ],
    };

    expect(findUnusedProviders(snapshot, graphqlSnapshot)).toEqual([]);
  });
});
