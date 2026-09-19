import { describe, it, expect } from 'vitest';
import { findDuplicateTokens } from '../duplicate-tokens';
import { buildSnapshot, providerNode } from '../../__tests__/fixtures';

describe('findDuplicateTokens', () => {
  it('flags a provider name registered in more than one module', () => {
    const snapshot = buildSnapshot(
      [providerNode('LoggerService', 'ModuleA'), providerNode('LoggerService', 'ModuleB')],
      [],
    );

    const issues = findDuplicateTokens(snapshot);

    expect(issues).toHaveLength(1);
    expect(issues[0].category).toBe('duplicate-token');
    expect(issues[0].severity).toBe('warning');
    expect(issues[0].nodeIds.sort()).toEqual([
      'provider:ModuleA:LoggerService',
      'provider:ModuleB:LoggerService',
    ]);
  });

  it('does not flag a provider registered only once', () => {
    const snapshot = buildSnapshot([providerNode('LoggerService', 'ModuleA')], []);

    expect(findDuplicateTokens(snapshot)).toEqual([]);
  });

  it('does not flag providers with different names', () => {
    const snapshot = buildSnapshot(
      [providerNode('LoggerService', 'ModuleA'), providerNode('CacheService', 'ModuleB')],
      [],
    );

    expect(findDuplicateTokens(snapshot)).toEqual([]);
  });
});
