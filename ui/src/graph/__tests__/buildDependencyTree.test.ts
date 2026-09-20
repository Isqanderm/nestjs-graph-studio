import { describe, it, expect } from 'vitest';
import { buildDependencyTree } from '../buildDependencyTree';
import { GraphNode, GraphEdge } from '../../types';

function node(id: string, type: GraphNode['type'] = 'PROVIDER'): GraphNode {
  return { id, name: id, type };
}

describe('buildDependencyTree', () => {
  it('builds an empty dependsOn/usedBy when the node has no edges', () => {
    const tree = buildDependencyTree([node('a')], [], 'a', 2);
    expect(tree.root).toEqual({ id: 'a', name: 'a', type: 'PROVIDER' });
    expect(tree.dependsOn).toEqual([]);
    expect(tree.usedBy).toEqual([]);
  });

  it('puts outgoing edges under dependsOn and incoming edges under usedBy', () => {
    const nodes = [node('a'), node('b'), node('c')];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', kind: 'injects' }, // a depends on b
      { from: 'c', to: 'a', kind: 'injects' }, // c uses a
    ];
    const tree = buildDependencyTree(nodes, edges, 'a', 2);

    expect(tree.dependsOn.map((n) => n.id)).toEqual(['b']);
    expect(tree.usedBy.map((n) => n.id)).toEqual(['c']);
  });

  it('recurses up to the given depth', () => {
    const nodes = [node('a'), node('b'), node('c'), node('d')];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', kind: 'injects' },
      { from: 'b', to: 'c', kind: 'injects' },
      { from: 'c', to: 'd', kind: 'injects' },
    ];
    const tree = buildDependencyTree(nodes, edges, 'a', 2);

    expect(tree.dependsOn[0].id).toBe('b');
    expect(tree.dependsOn[0].children[0].id).toBe('c');
    // depth 2 from 'a' reaches 'c' but not its child 'd'
    expect(tree.dependsOn[0].children[0].children).toEqual([]);
  });

  it('stops recursing (depth-limited) rather than expanding beyond the requested depth', () => {
    const nodes = [node('a'), node('b'), node('c')];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', kind: 'injects' },
      { from: 'b', to: 'c', kind: 'injects' },
    ];
    const tree = buildDependencyTree(nodes, edges, 'a', 1);

    expect(tree.dependsOn[0].id).toBe('b');
    expect(tree.dependsOn[0].children).toEqual([]);
  });

  it('marks a node that cycles back to one of its own ancestors instead of recursing forever', () => {
    const nodes = [node('a'), node('b'), node('c')];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', kind: 'injects' },
      { from: 'b', to: 'c', kind: 'injects' },
      { from: 'c', to: 'a', kind: 'injects' }, // cycle back to the root
    ];
    const tree = buildDependencyTree(nodes, edges, 'a', 'all');

    const b = tree.dependsOn[0];
    const c = b.children[0];
    const cycledA = c.children[0];
    expect(cycledA).toMatchObject({ id: 'a', isCycle: true, children: [] });
  });

  it('treats "all" depth as unbounded, limited only by cycle detection', () => {
    const nodes = [node('a'), node('b'), node('c'), node('d'), node('e')];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', kind: 'injects' },
      { from: 'b', to: 'c', kind: 'injects' },
      { from: 'c', to: 'd', kind: 'injects' },
      { from: 'd', to: 'e', kind: 'injects' },
    ];
    const tree = buildDependencyTree(nodes, edges, 'a', 'all');

    expect(tree.dependsOn[0].children[0].children[0].children[0].id).toBe('e');
  });

  it('does not mark isCycle on nodes reached independently (only on true ancestor cycles)', () => {
    // a depends on both b and c; b and c both depend on d. d is not an
    // ancestor of itself via either path, so it must not be flagged.
    const nodes = [node('a'), node('b'), node('c'), node('d')];
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', kind: 'injects' },
      { from: 'a', to: 'c', kind: 'injects' },
      { from: 'b', to: 'd', kind: 'injects' },
      { from: 'c', to: 'd', kind: 'injects' },
    ];
    const tree = buildDependencyTree(nodes, edges, 'a', 'all');

    const viaB = tree.dependsOn.find((n) => n.id === 'b')!.children[0];
    const viaC = tree.dependsOn.find((n) => n.id === 'c')!.children[0];
    expect(viaB).toMatchObject({ id: 'd', isCycle: false });
    expect(viaC).toMatchObject({ id: 'd', isCycle: false });
  });
});
