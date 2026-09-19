import { describe, it, expect } from 'vitest';
import { findCircularDependencies } from '../circular-dependencies';
import { buildSnapshot, moduleNode, providerNode, edge } from '../../__tests__/fixtures';

describe('findCircularDependencies', () => {
  it('returns no issues when there are no cycles', () => {
    const snapshot = buildSnapshot(
      [moduleNode('ModuleA'), moduleNode('ModuleB')],
      [edge('module:ModuleA', 'module:ModuleB', 'import')],
    );

    expect(findCircularDependencies(snapshot)).toEqual([]);
  });

  it('detects a circular module import', () => {
    const snapshot = buildSnapshot(
      [moduleNode('ModuleA'), moduleNode('ModuleB')],
      [
        edge('module:ModuleA', 'module:ModuleB', 'import'),
        edge('module:ModuleB', 'module:ModuleA', 'import'),
      ],
    );

    const issues = findCircularDependencies(snapshot);

    expect(issues).toHaveLength(1);
    expect(issues[0].category).toBe('circular-dependency');
    expect(issues[0].severity).toBe('warning');
    expect(issues[0].title).toMatch(/^Circular module import:/);
    expect(issues[0].nodeIds.sort()).toEqual(['module:ModuleA', 'module:ModuleB']);
  });

  it('detects a circular provider injection', () => {
    const snapshot = buildSnapshot(
      [providerNode('ServiceA', 'AppModule'), providerNode('ServiceB', 'AppModule')],
      [
        edge('provider:AppModule:ServiceA', 'provider:AppModule:ServiceB', 'injects'),
        edge('provider:AppModule:ServiceB', 'provider:AppModule:ServiceA', 'injects'),
      ],
    );

    const issues = findCircularDependencies(snapshot);

    expect(issues).toHaveLength(1);
    expect(issues[0].title).toMatch(/^Circular dependency injection:/);
    expect(issues[0].nodeIds.sort()).toEqual([
      'provider:AppModule:ServiceA',
      'provider:AppModule:ServiceB',
    ]);
    expect(issues[0].description).toContain('forwardRef');
  });

  it('deduplicates a cycle reached from multiple entry points', () => {
    const snapshot = buildSnapshot(
      [
        moduleNode('EntryModule'),
        moduleNode('ModuleA'),
        moduleNode('ModuleB'),
        moduleNode('ModuleC'),
      ],
      [
        edge('module:EntryModule', 'module:ModuleA', 'import'),
        edge('module:ModuleA', 'module:ModuleB', 'import'),
        edge('module:ModuleB', 'module:ModuleC', 'import'),
        edge('module:ModuleC', 'module:ModuleA', 'import'),
      ],
    );

    const issues = findCircularDependencies(snapshot);

    expect(issues).toHaveLength(1);
    expect(issues[0].nodeIds.sort()).toEqual([
      'module:ModuleA',
      'module:ModuleB',
      'module:ModuleC',
    ]);
  });

  it('does not flag providers that only depend on each other in one direction', () => {
    const snapshot = buildSnapshot(
      [providerNode('ServiceA', 'AppModule'), providerNode('ServiceB', 'AppModule')],
      [edge('provider:AppModule:ServiceA', 'provider:AppModule:ServiceB', 'injects')],
    );

    expect(findCircularDependencies(snapshot)).toEqual([]);
  });
});
