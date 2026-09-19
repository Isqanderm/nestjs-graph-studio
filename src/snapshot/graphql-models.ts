/**
 * Data models for GraphQL resolver operations.
 *
 * Deliberately separate from `./models.ts` (REST routes) — a GraphQL operation
 * is not an HTTP route, and this type never appears inside `GraphSnapshot.routes`.
 */

import { RouteChain } from './models';

export type GraphQLOperationKind = 'QUERY' | 'MUTATION' | 'SUBSCRIPTION' | 'FIELD';

export interface GraphQLOperationMeta {
  kind: GraphQLOperationKind;
  /** 'Query' | 'Mutation' | 'Subscription' for operations, or the parent object type name for FIELD */
  typeName: string;
  /** GraphQL schema field name */
  fieldName: string;
  /** Name of the @Resolver() class */
  resolverClass: string;
  /** Method name on the resolver class */
  methodName: string;
  chain: RouteChain;
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
