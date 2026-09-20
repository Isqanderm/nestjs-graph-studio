import { describe, it, expect } from 'vitest';
import { Node, Edge } from 'reactflow';
import { getLayoutedElements } from '../layoutUtils';

interface TestNodeData {
  module?: string;
}

function makeNode(id: string, module?: string): Node<TestNodeData> {
  return { id, type: 'custom', position: { x: 0, y: 0 }, data: { module } };
}

describe('getLayoutedElements', () => {
  describe('groupByModule = false (default)', () => {
    it('does not create any group nodes', () => {
      const nodes = [makeNode('a', 'ModuleA'), makeNode('b', 'ModuleA'), makeNode('c')];
      const edges: Edge[] = [{ id: 'e1', source: 'a', target: 'b' }];

      const { nodes: result } = getLayoutedElements(nodes, edges);

      expect(result.every((n) => n.type !== 'group')).toBe(true);
      expect(result).toHaveLength(3);
      expect(result.every((n) => n.parentNode === undefined)).toBe(true);
    });
  });

  describe('groupByModule = true', () => {
    it('creates one group node per module with 2+ members', () => {
      const nodes = [
        makeNode('a', 'ModuleA'),
        makeNode('b', 'ModuleA'),
        makeNode('c', 'ModuleB'),
        makeNode('d', 'ModuleB'),
        makeNode('e', 'ModuleB'),
      ];
      const edges: Edge[] = [];

      const { nodes: result } = getLayoutedElements(nodes, edges, 'LR', true);

      const groups = result.filter((n) => n.type === 'group');
      expect(groups.map((g) => g.id).sort()).toEqual(['cluster__ModuleA', 'cluster__ModuleB']);
    });

    it('does not create a group for a module with only one member', () => {
      const nodes = [makeNode('a', 'SoloModule'), makeNode('b', 'ModuleA'), makeNode('c', 'ModuleA')];
      const edges: Edge[] = [];

      const { nodes: result } = getLayoutedElements(nodes, edges, 'LR', true);

      const groups = result.filter((n) => n.type === 'group');
      expect(groups.map((g) => g.id)).toEqual(['cluster__ModuleA']);

      const solo = result.find((n) => n.id === 'a')!;
      expect(solo.parentNode).toBeUndefined();
    });

    it('does not group nodes with no module at all', () => {
      const nodes = [makeNode('a'), makeNode('b')];
      const edges: Edge[] = [];

      const { nodes: result } = getLayoutedElements(nodes, edges, 'LR', true);

      expect(result.filter((n) => n.type === 'group')).toHaveLength(0);
      expect(result.every((n) => n.parentNode === undefined)).toBe(true);
    });

    it('parents grouped members to their module cluster with parent-relative positions', () => {
      const nodes = [makeNode('a', 'ModuleA'), makeNode('b', 'ModuleA')];
      const edges: Edge[] = [{ id: 'e1', source: 'a', target: 'b' }];

      const { nodes: result } = getLayoutedElements(nodes, edges, 'LR', true);

      const group = result.find((n) => n.id === 'cluster__ModuleA')!;
      const a = result.find((n) => n.id === 'a')!;
      const b = result.find((n) => n.id === 'b')!;

      expect(a.parentNode).toBe('cluster__ModuleA');
      expect(a.extent).toBe('parent');
      expect(b.parentNode).toBe('cluster__ModuleA');

      // Children are positioned relative to the parent and must fit within
      // its box (allowing for the node's own width/height).
      const groupWidth = (group.style as { width: number }).width;
      const groupHeight = (group.style as { height: number }).height;
      expect(a.position.x).toBeGreaterThanOrEqual(0);
      expect(a.position.y).toBeGreaterThanOrEqual(0);
      expect(a.position.x).toBeLessThanOrEqual(groupWidth);
      expect(a.position.y).toBeLessThanOrEqual(groupHeight);
      expect(b.position.x).toBeGreaterThanOrEqual(0);
      expect(b.position.y).toBeGreaterThanOrEqual(0);
    });

    it('places every group node before its children in the returned array', () => {
      const nodes = [makeNode('a', 'ModuleA'), makeNode('b', 'ModuleA'), makeNode('c', 'ModuleB'), makeNode('d', 'ModuleB')];
      const edges: Edge[] = [];

      const { nodes: result } = getLayoutedElements(nodes, edges, 'LR', true);

      const indexOf = (id: string) => result.findIndex((n) => n.id === id);
      const groupIndex = indexOf('cluster__ModuleA');
      expect(groupIndex).toBeGreaterThanOrEqual(0);
      expect(indexOf('a')).toBeGreaterThan(groupIndex);
      expect(indexOf('b')).toBeGreaterThan(groupIndex);
    });

    it('does not overlap two different module group boxes', () => {
      const nodes = [
        makeNode('a', 'ModuleA'),
        makeNode('b', 'ModuleA'),
        makeNode('c', 'ModuleB'),
        makeNode('d', 'ModuleB'),
      ];
      // Cross-module edges are exactly the case that scattered members
      // across the canvas before compound clustering.
      const edges: Edge[] = [
        { id: 'e1', source: 'a', target: 'c' },
        { id: 'e2', source: 'b', target: 'd' },
      ];

      const { nodes: result } = getLayoutedElements(nodes, edges, 'LR', true);

      const groups = result.filter((n) => n.type === 'group');
      const boxes = groups.map((g) => {
        const { x, y } = g.position;
        const { width, height } = g.style as { width: number; height: number };
        return { x0: x, x1: x + width, y0: y, y1: y + height };
      });

      const overlaps = (a: typeof boxes[0], b: typeof boxes[0]) =>
        a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

      expect(overlaps(boxes[0], boxes[1])).toBe(false);
    });
  });
});
