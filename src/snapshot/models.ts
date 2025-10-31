/**
 * Data models for graph snapshots and trace events
 */

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

export interface SerializedError {
  name: string;
  message: string;
  stack?: string[];
  cause?: string;
}

export type TraceEvent =
  | {
      type: 'request:start';
      requestId: string;
      method: string;
      path: string;
      sampleIn?: any;
      t0: number;
    }
  | {
      type: 'request:end';
      requestId: string;
      status: number;
      dt: number;
      size?: number;
    }
  | {
      type: 'request:error';
      requestId: string;
      dt: number;
      error: SerializedError;
    }
  | {
      type: 'handler:return';
      requestId: string;
      controller: string;
      handler: string;
      sampleOut?: any;
    }
  | {
      type: `${Stage}:start`;
      requestId: string;
      name: string;
      args?: any[];
    }
  | {
      type: `${Stage}:end`;
      requestId: string;
      name: string;
      dt: number;
      result?: any;
    }
  | {
      type: `${Stage}:error`;
      requestId: string;
      name: string;
      dt: number;
      error: SerializedError;
    };

export function serializeError(error: any): SerializedError {
  return {
    name: error?.name || 'Error',
    message: error?.message || String(error),
    stack: error?.stack?.split('\n').slice(0, 10),
    cause: error?.cause ? String(error.cause) : undefined,
  };
}

