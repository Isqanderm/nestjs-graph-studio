/**
 * Collect GraphQL resolver metadata (queries, mutations, subscriptions, field resolvers).
 *
 * Deliberately independent from `SnapshotCollector` (REST route collection) — a GraphQL
 * operation is a different concept from an HTTP route. It is served on its own endpoint
 * (`GraphQlStudioController`) and shown in its own UI view, and never merged into
 * `RouteMeta`/`GraphSnapshot.routes`.
 *
 * Detection relies on the reflect-metadata keys that @nestjs/graphql's decorators set
 * (see node_modules/@nestjs/graphql/dist/graphql.constants.js, verified against v13.1.0 —
 * unchanged since early v6). These are duplicated here as literals instead of importing
 * @nestjs/graphql, so this package stays dependency-free for apps that don't use GraphQL;
 * the checks below are cheap `Reflect.hasMetadata` lookups and are a no-op for them.
 */

import 'reflect-metadata';
import { Injectable, Inject } from '@nestjs/common';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import {
  GUARDS_METADATA,
  INTERCEPTORS_METADATA,
  PIPES_METADATA,
  EXCEPTION_FILTERS_METADATA,
} from '@nestjs/common/constants';
import { RouteChain } from './models';
import {
  GraphQLOperationMeta,
  GraphQLOperationKind,
  GraphQLSnapshot,
  GraphQLStats,
} from './graphql-models';

const GQL_RESOLVER_TYPE_METADATA = 'graphql:resolver_type';
// Exported for src/snapshot/collector.ts, which uses the same check to mark
// resolver providers as entry points (see GraphNode.isEntryPoint) — reuses
// this literal instead of re-duplicating the "no @nestjs/graphql dependency"
// rationale a second time.
export const GQL_RESOLVER_NAME_METADATA = 'graphql:resolver_name';
const GQL_RESOLVER_PROPERTY_METADATA = 'graphql:resolve_property';

@Injectable()
export class GraphQLOperationCollector {
  constructor(
    @Inject(ModulesContainer) private readonly modulesContainer: ModulesContainer,
    @Inject(Reflector) private readonly reflector: Reflector,
  ) {}

  collect(): GraphQLSnapshot {
    const operations: GraphQLOperationMeta[] = [];
    const stats: GraphQLStats = {
      resolverClasses: 0,
      queries: 0,
      mutations: 0,
      subscriptions: 0,
      fields: 0,
    };

    for (const [, moduleRef] of this.modulesContainer.entries()) {
      for (const [, wrapper] of moduleRef.providers) {
        this.collectResolver(wrapper, operations, stats);
      }
    }

    return {
      createdAt: new Date().toISOString(),
      stats,
      operations,
    };
  }

  private collectResolver(
    wrapper: InstanceWrapper,
    operations: GraphQLOperationMeta[],
    stats: GraphQLStats,
  ): void {
    const metatype = wrapper.metatype as Function | undefined;
    if (!metatype || !Reflect.hasMetadata(GQL_RESOLVER_NAME_METADATA, metatype)) {
      return;
    }

    stats.resolverClasses++;
    const resolverClass = metatype.name;
    const parentTypeName = Reflect.getMetadata(GQL_RESOLVER_NAME_METADATA, metatype) || resolverClass;
    const prototype = (metatype as any).prototype;

    // Known limitation: only the resolver's own prototype is scanned, so a
    // @Query()/@Mutation()/@ResolveField() declared on a base class (e.g. an
    // abstract/generic resolver factory extended by this class) is not picked
    // up here. This mirrors the identical limitation in the REST collector
    // (collector.ts) for @Controller() inheritance.
    const methodNames = Object.getOwnPropertyNames(prototype).filter(
      (name) => name !== 'constructor' && typeof prototype[name] === 'function',
    );

    for (const methodName of methodNames) {
      const methodFn = prototype[methodName];
      const isField = Reflect.getMetadata(GQL_RESOLVER_PROPERTY_METADATA, methodFn) === true;
      const operationType = Reflect.getMetadata(GQL_RESOLVER_TYPE_METADATA, methodFn);

      let kind: GraphQLOperationKind;
      let typeName: string;

      if (isField) {
        kind = 'FIELD';
        typeName = parentTypeName;
      } else if (operationType === 'Query') {
        kind = 'QUERY';
        typeName = 'Query';
      } else if (operationType === 'Mutation') {
        kind = 'MUTATION';
        typeName = 'Mutation';
      } else if (operationType === 'Subscription') {
        kind = 'SUBSCRIPTION';
        typeName = 'Subscription';
      } else {
        continue;
      }

      const fieldName = Reflect.getMetadata(GQL_RESOLVER_NAME_METADATA, methodFn) || methodName;

      operations.push({
        kind,
        typeName,
        fieldName,
        resolverClass,
        methodName,
        chain: this.collectChain(metatype, methodFn),
      });

      if (kind === 'QUERY') stats.queries++;
      else if (kind === 'MUTATION') stats.mutations++;
      else if (kind === 'SUBSCRIPTION') stats.subscriptions++;
      else stats.fields++;
    }
  }

  private collectChain(resolverClass: any, handlerMethod: any): RouteChain {
    const classGuards = this.reflector.get<any[]>(GUARDS_METADATA, resolverClass) || [];
    const methodGuards = this.reflector.get<any[]>(GUARDS_METADATA, handlerMethod) || [];

    const classPipes = this.reflector.get<any[]>(PIPES_METADATA, resolverClass) || [];
    const methodPipes = this.reflector.get<any[]>(PIPES_METADATA, handlerMethod) || [];

    const classInterceptors = this.reflector.get<any[]>(INTERCEPTORS_METADATA, resolverClass) || [];
    const methodInterceptors = this.reflector.get<any[]>(INTERCEPTORS_METADATA, handlerMethod) || [];

    const classFilters = this.reflector.get<any[]>(EXCEPTION_FILTERS_METADATA, resolverClass) || [];
    const methodFilters = this.reflector.get<any[]>(EXCEPTION_FILTERS_METADATA, handlerMethod) || [];

    return {
      guards: [...classGuards, ...methodGuards].map(this.getName),
      pipes: [...classPipes, ...methodPipes].map(this.getName),
      interceptors: [...classInterceptors, ...methodInterceptors].map(this.getName),
      filters: [...classFilters, ...methodFilters].map(this.getName),
    };
  }

  private getName(item: any): string {
    if (typeof item === 'function') {
      return item.name || 'Anonymous';
    }
    if (item && typeof item === 'object' && item.constructor) {
      return item.constructor.name || 'Anonymous';
    }
    return String(item);
  }
}
