export type Scope = 'SINGLETON' | 'REQUEST' | 'TRANSIENT';
export type NodeType = 'MODULE' | 'PROVIDER' | 'CONTROLLER' | 'ROUTE' | 'MISSING';
export type EdgeKind = 'import' | 'export' | 'injects' | 'handles' | 'missing';
export type Stage = 'guard' | 'pipe' | 'interceptor' | 'handler' | 'filter' | 'request';

export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  scope?: Scope;
  module?: string;
  route?: {
    method: string;
    path: string;
  };
  missing?: {
    requiredBy: string[]; // IDs of nodes that require this missing dependency
    suggestedFix?: string; // Suggested fix message
  };
}

export interface GraphEdge {
  from: string;
  to: string;
  kind: EdgeKind;
}

export interface RouteChain {
  guards: string[];
  pipes: string[];
  interceptors: string[];
  filters: string[];
}

export interface RouteMeta {
  method: string;
  path: string;
  controller: string;
  handler: string;
  chain: RouteChain;
}

export interface GraphStats {
  modules: number;
  providers: number;
  controllers: number;
  routes: number;
}

export interface GraphSnapshot {
  createdAt: string;
  stats: GraphStats;
  nodes: GraphNode[];
  edges: GraphEdge[];
  routes: RouteMeta[];
}

