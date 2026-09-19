import { GraphSnapshot, GraphNode, GraphEdge, RouteMeta, RouteChain } from '../../snapshot/models';

export function buildSnapshot(
  nodes: GraphNode[],
  edges: GraphEdge[],
  routes: RouteMeta[] = [],
): GraphSnapshot {
  return {
    createdAt: new Date().toISOString(),
    stats: {
      modules: nodes.filter((n) => n.type === 'MODULE').length,
      providers: nodes.filter((n) => n.type === 'PROVIDER').length,
      controllers: nodes.filter((n) => n.type === 'CONTROLLER').length,
      routes: nodes.filter((n) => n.type === 'ROUTE').length,
    },
    nodes,
    edges,
    routes,
  };
}

export function moduleNode(name: string): GraphNode {
  return { id: `module:${name}`, name, type: 'MODULE' };
}

export function providerNode(
  name: string,
  moduleName: string,
  scope: GraphNode['scope'] = 'SINGLETON',
  isEntryPoint = false,
): GraphNode {
  return {
    id: `provider:${moduleName}:${name}`,
    name,
    type: 'PROVIDER',
    module: moduleName,
    scope,
    isEntryPoint,
  };
}

export function controllerNode(name: string, moduleName: string): GraphNode {
  return {
    id: `controller:${moduleName}:${name}`,
    name,
    type: 'CONTROLLER',
    module: moduleName,
  };
}

export function edge(from: string, to: string, kind: GraphEdge['kind']): GraphEdge {
  return { from, to, kind };
}

export function routeMeta(chain: Partial<RouteChain> = {}): RouteMeta {
  return {
    method: 'GET',
    path: '/test',
    controller: 'TestController',
    handler: 'testHandler',
    chain: {
      guards: [],
      pipes: [],
      interceptors: [],
      filters: [],
      ...chain,
    },
  };
}
