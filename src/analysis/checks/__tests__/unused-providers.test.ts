import { describe, it, expect } from 'vitest';
import { findUnusedProviders } from '../unused-providers';
import { buildSnapshot, moduleNode, providerNode, controllerNode, edge } from '../../__tests__/fixtures';

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
});
