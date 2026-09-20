import { describe, it, expect } from 'vitest';
import { computeNeighborhood } from '../neighborhood';
import { GraphEdge } from '../../types';

// Chain: a -> b -> c -> d (a "depends on" b "depends on" c "depends on" d)
function chainEdges(): GraphEdge[] {
  return [
    { from: 'a', to: 'b', kind: 'injects' },
    { from: 'b', to: 'c', kind: 'injects' },
    { from: 'c', to: 'd', kind: 'injects' },
  ];
}

describe('computeNeighborhood', () => {
  it('always includes the focus node itself, even with no edges', () => {
    const result = computeNeighborhood([], 'a', 1);
    expect(result.nodeIds).toEqual(new Set(['a']));
    expect(result.edges).toEqual([]);
  });

  it('depth 1 includes only direct neighbors in both directions', () => {
    const result = computeNeighborhood(chainEdges(), 'b', 1);
    expect(result.nodeIds).toEqual(new Set(['a', 'b', 'c']));
  });

  it('depth 2 includes neighbors of neighbors', () => {
    const result = computeNeighborhood(chainEdges(), 'b', 2);
    expect(result.nodeIds).toEqual(new Set(['a', 'b', 'c', 'd']));
  });

  it('"all" depth includes the full transitive closure', () => {
    const result = computeNeighborhood(chainEdges(), 'a', 'all');
    expect(result.nodeIds).toEqual(new Set(['a', 'b', 'c', 'd']));
  });

  it('excludes unrelated nodes not reachable from the focus node', () => {
    const edges: GraphEdge[] = [...chainEdges(), { from: 'x', to: 'y', kind: 'injects' }];
    const result = computeNeighborhood(edges, 'a', 'all');
    expect(result.nodeIds.has('x')).toBe(false);
    expect(result.nodeIds.has('y')).toBe(false);
  });

  it('only returns edges that connect two included nodes', () => {
    const result = computeNeighborhood(chainEdges(), 'b', 1);
    expect(result.edges).toEqual([
      { from: 'a', to: 'b', kind: 'injects' },
      { from: 'b', to: 'c', kind: 'injects' },
    ]);
  });

  it('handles a cycle without infinite looping', () => {
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', kind: 'injects' },
      { from: 'b', to: 'a', kind: 'injects' },
    ];
    const result = computeNeighborhood(edges, 'a', 'all');
    expect(result.nodeIds).toEqual(new Set(['a', 'b']));
  });

  it('follows both outgoing and incoming edges from a branching node', () => {
    const edges: GraphEdge[] = [
      { from: 'consumer1', to: 'focus', kind: 'injects' },
      { from: 'consumer2', to: 'focus', kind: 'injects' },
      { from: 'focus', to: 'dep1', kind: 'injects' },
    ];
    const result = computeNeighborhood(edges, 'focus', 1);
    expect(result.nodeIds).toEqual(new Set(['focus', 'consumer1', 'consumer2', 'dep1']));
  });
});
