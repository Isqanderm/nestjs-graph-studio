import { describe, it, expect } from 'vitest';
import { findScopeConflicts } from '../scope-conflicts';
import { buildSnapshot, providerNode, edge } from '../../__tests__/fixtures';

describe('findScopeConflicts', () => {
  it('flags a SINGLETON provider that directly depends on a REQUEST-scoped provider', () => {
    const snapshot = buildSnapshot(
      [
        providerNode('CacheService', 'AppModule', 'SINGLETON'),
        providerNode('RequestContext', 'AppModule', 'REQUEST'),
      ],
      [edge('provider:AppModule:CacheService', 'provider:AppModule:RequestContext', 'injects')],
    );

    const issues = findScopeConflicts(snapshot);

    expect(issues).toHaveLength(1);
    expect(issues[0].category).toBe('scope-conflict');
    expect(issues[0].severity).toBe('warning');
    expect(issues[0].nodeIds).toContain('provider:AppModule:CacheService');
    expect(issues[0].nodeIds).toContain('provider:AppModule:RequestContext');
  });

  it('flags each SINGLETON provider on a transitive path to a REQUEST-scoped provider', () => {
    const snapshot = buildSnapshot(
      [
        providerNode('CacheService', 'AppModule', 'SINGLETON'),
        providerNode('AuditService', 'AppModule', 'SINGLETON'),
        providerNode('RequestContext', 'AppModule', 'REQUEST'),
      ],
      [
        edge('provider:AppModule:CacheService', 'provider:AppModule:AuditService', 'injects'),
        edge('provider:AppModule:AuditService', 'provider:AppModule:RequestContext', 'injects'),
      ],
    );

    const issues = findScopeConflicts(snapshot);

    expect(issues).toHaveLength(2);
    const flaggedIds = issues.map((issue) => issue.nodeIds[0]);
    expect(flaggedIds).toContain('provider:AppModule:CacheService');
    expect(flaggedIds).toContain('provider:AppModule:AuditService');
  });

  it('does not flag a SINGLETON provider with only SINGLETON/TRANSIENT dependencies', () => {
    const snapshot = buildSnapshot(
      [
        providerNode('CacheService', 'AppModule', 'SINGLETON'),
        providerNode('HelperService', 'AppModule', 'TRANSIENT'),
      ],
      [edge('provider:AppModule:CacheService', 'provider:AppModule:HelperService', 'injects')],
    );

    expect(findScopeConflicts(snapshot)).toEqual([]);
  });

  it('does not flag a provider that is already REQUEST-scoped', () => {
    const snapshot = buildSnapshot(
      [
        providerNode('RequestAwareService', 'AppModule', 'REQUEST'),
        providerNode('RequestContext', 'AppModule', 'REQUEST'),
      ],
      [edge('provider:AppModule:RequestAwareService', 'provider:AppModule:RequestContext', 'injects')],
    );

    expect(findScopeConflicts(snapshot)).toEqual([]);
  });
});
