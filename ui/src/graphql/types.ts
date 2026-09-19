/**
 * Mirrors the backend's `src/snapshot/graphql-models.ts`. Kept separate from
 * `../types.ts` (REST route/graph types), matching how the backend keeps
 * graphql-models.ts separate from models.ts.
 */

export type GraphQLOperationKind = 'QUERY' | 'MUTATION' | 'SUBSCRIPTION' | 'FIELD';

export interface GraphQLOperationChain {
  guards: string[];
  pipes: string[];
  interceptors: string[];
  filters: string[];
}

export interface GraphQLOperationMeta {
  kind: GraphQLOperationKind;
  typeName: string;
  fieldName: string;
  resolverClass: string;
  methodName: string;
  chain: GraphQLOperationChain;
}

export interface GraphQLStats {
  resolverClasses: number;
  queries: number;
  mutations: number;
  subscriptions: number;
  fields: number;
}

export interface GraphQLSnapshot {
  createdAt: string;
  stats: GraphQLStats;
  operations: GraphQLOperationMeta[];
}
