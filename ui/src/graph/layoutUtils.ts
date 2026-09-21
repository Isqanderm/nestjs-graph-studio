import dagre from '@dagrejs/dagre';
import { Node, Edge, Position } from 'reactflow';

const GROUP_PADDING = 24;
const GROUP_LABEL_HEIGHT = 32;

interface LayoutNodeData {
  module?: string;
}

const clusterIdFor = (moduleKey: string) => `cluster__${moduleKey}`;

export const getLayoutedElements = <T extends LayoutNodeData>(
  nodes: Node<T>[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'LR',
  groupByModule = false
) => {
  const dagreGraph = new dagre.graphlib.Graph({ compound: true });
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 140;
  const nodeHeight = 44;

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 50,
    ranksep: 100,
    edgesep: 15,
    ranker: 'tight-tree',
  });

  // Module membership doesn't correlate with DI-edge-based layout position —
  // members of the same module can end up scattered across the whole canvas.
  // Registering each module as a dagre compound-graph cluster (setParent)
  // makes dagre keep a cluster's members close together and gives each
  // module a real, non-overlapping bounding box we can draw a swimlane
  // around, instead of computing a box after the fact that would span most
  // of the graph. Only modules with 2+ members get a cluster/box — a single
  // node has nothing to visually group.
  const moduleMembers = new Map<string, string[]>();
  if (groupByModule) {
    nodes.forEach((node) => {
      const moduleKey = node.data?.module;
      if (moduleKey) {
        const members = moduleMembers.get(moduleKey) ?? [];
        members.push(node.id);
        moduleMembers.set(moduleKey, members);
      }
    });
  }

  const clusteredModules = new Set(
    Array.from(moduleMembers.entries())
      .filter(([, members]) => members.length >= 2)
      .map(([moduleKey]) => moduleKey)
  );

  clusteredModules.forEach((moduleKey) => {
    dagreGraph.setNode(clusterIdFor(moduleKey), {});
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    const moduleKey = node.data?.module;
    if (moduleKey && clusteredModules.has(moduleKey)) {
      dagreGraph.setParent(node.id, clusterIdFor(moduleKey));
    }
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const groupNodes: Node<T>[] = Array.from(clusteredModules).map((moduleKey) => {
    const cluster = dagreGraph.node(clusterIdFor(moduleKey));
    return {
      id: clusterIdFor(moduleKey),
      type: 'group',
      position: {
        x: cluster.x - cluster.width / 2 - GROUP_PADDING,
        y: cluster.y - cluster.height / 2 - GROUP_PADDING - GROUP_LABEL_HEIGHT,
      },
      style: {
        width: cluster.width + GROUP_PADDING * 2,
        height: cluster.height + GROUP_PADDING * 2 + GROUP_LABEL_HEIGHT,
      },
      data: { label: moduleKey } as unknown as T,
      selectable: false,
      draggable: false,
      zIndex: -1,
    };
  });

  const groupPositionById = new Map(groupNodes.map((g) => [g.id, g.position]));

  const layoutedNodes: Node<T>[] = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const moduleKey = node.data?.module;
    const parentId = moduleKey && clusteredModules.has(moduleKey) ? clusterIdFor(moduleKey) : undefined;
    const absoluteX = nodeWithPosition.x - nodeWidth / 2;
    const absoluteY = nodeWithPosition.y - nodeHeight / 2;

    const base = {
      ...node,
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    };

    if (parentId) {
      const parentPos = groupPositionById.get(parentId)!;
      return {
        ...base,
        parentNode: parentId,
        extent: 'parent' as const,
        position: {
          x: absoluteX - parentPos.x,
          y: absoluteY - parentPos.y,
        },
      };
    }

    return {
      ...base,
      position: { x: absoluteX, y: absoluteY },
    };
  });

  return { nodes: [...groupNodes, ...layoutedNodes], edges };
};
