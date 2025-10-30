/**
 * Collect DI graph and route metadata from NestJS application
 */

import 'reflect-metadata';
import { Injectable, RequestMethod, Inject } from '@nestjs/common';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import {
  GraphSnapshot,
  GraphNode,
  GraphEdge,
  RouteMeta,
  GraphStats,
  RouteChain,
} from './models';
import {
  GUARDS_METADATA,
  INTERCEPTORS_METADATA,
  PIPES_METADATA,
  EXCEPTION_FILTERS_METADATA,
  PATH_METADATA,
  METHOD_METADATA,
  SELF_DECLARED_DEPS_METADATA,
  PARAMTYPES_METADATA,
} from '@nestjs/common/constants';

// Map RequestMethod enum to string
const METHOD_MAP: Record<number, string> = {
  [RequestMethod.GET]: 'GET',
  [RequestMethod.POST]: 'POST',
  [RequestMethod.PUT]: 'PUT',
  [RequestMethod.DELETE]: 'DELETE',
  [RequestMethod.PATCH]: 'PATCH',
  [RequestMethod.OPTIONS]: 'OPTIONS',
  [RequestMethod.HEAD]: 'HEAD',
  [RequestMethod.ALL]: 'ALL',
};

@Injectable()
export class SnapshotCollector {
  constructor(
    @Inject(ModulesContainer) private readonly modulesContainer: ModulesContainer,
    @Inject(Reflector) private readonly reflector: Reflector,
  ) {}

  /**
   * Collect complete graph snapshot
   */
  collect(): GraphSnapshot {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const routes: RouteMeta[] = [];
    const stats: GraphStats = {
      modules: 0,
      providers: 0,
      controllers: 0,
      routes: 0,
    };

    // Track missing dependencies
    const missingDeps = new Map<string, Set<string>>(); // dependencyName -> Set of requiredBy IDs

    // Iterate through all modules
    for (const [, moduleRef] of this.modulesContainer.entries()) {
      this.collectModule(moduleRef, nodes, edges, routes, stats);
    }

    // Collect dependency injection edges (second pass after all nodes are collected)
    for (const [, moduleRef] of this.modulesContainer.entries()) {
      this.collectDependencies(moduleRef, edges, nodes, missingDeps);
    }

    // Add missing dependency nodes
    for (const [depName, requiredBy] of missingDeps.entries()) {
      const missingId = `missing:${depName}`;
      nodes.push({
        id: missingId,
        name: depName,
        type: 'MISSING',
        missing: {
          requiredBy: Array.from(requiredBy),
          suggestedFix: `Add ${depName} to the module's providers or import the module that exports it`,
        },
      });

      // Add edges from providers to missing dependencies
      for (const fromId of requiredBy) {
        edges.push({
          from: fromId,
          to: missingId,
          kind: 'missing',
        });
      }
    }

    return {
      createdAt: new Date().toISOString(),
      stats,
      nodes,
      edges,
      routes,
    };
  }

  private collectModule(
    moduleRef: Module,
    nodes: GraphNode[],
    edges: GraphEdge[],
    routes: RouteMeta[],
    stats: GraphStats,
  ): void {
    const moduleName = moduleRef.metatype?.name || 'UnknownModule';
    const moduleId = `module:${moduleName}`;

    // Add module node only if it doesn't already exist
    const moduleExists = nodes.some(node => node.id === moduleId);
    if (!moduleExists) {
      nodes.push({
        id: moduleId,
        name: moduleName,
        type: 'MODULE',
      });
      stats.modules++;
    }

    // Collect imports
    for (const importedModule of moduleRef.imports) {
      const importedName = importedModule.metatype?.name || 'UnknownModule';
      edges.push({
        from: moduleId,
        to: `module:${importedName}`,
        kind: 'import',
      });
    }

    // Collect providers
    for (const [, wrapper] of moduleRef.providers) {
      this.collectProvider(wrapper, moduleId, moduleName, nodes, edges, stats);
    }

    // Collect controllers
    for (const [, wrapper] of moduleRef.controllers) {
      this.collectController(wrapper, moduleId, moduleName, nodes, edges, routes, stats);
    }
  }

  private collectProvider(
    wrapper: InstanceWrapper,
    moduleId: string,
    moduleName: string,
    nodes: GraphNode[],
    edges: GraphEdge[],
    stats: GraphStats,
  ): void {
    if (!wrapper.metatype) {
      return;
    }

    const providerName = wrapper.name || wrapper.metatype.name || 'UnknownProvider';
    const providerId = `provider:${moduleName}:${providerName}`;

    // Add provider node only if it doesn't already exist
    const providerExists = nodes.some(node => node.id === providerId);
    if (!providerExists) {
      nodes.push({
        id: providerId,
        name: providerName,
        type: 'PROVIDER',
        scope: this.getScopeName(wrapper.scope),
        module: moduleName,
      });
      stats.providers++;

      // Link provider to module
      edges.push({
        from: moduleId,
        to: providerId,
        kind: 'export',
      });
    }
  }

  private collectController(
    wrapper: InstanceWrapper,
    moduleId: string,
    moduleName: string,
    nodes: GraphNode[],
    edges: GraphEdge[],
    routes: RouteMeta[],
    stats: GraphStats,
  ): void {
    if (!wrapper.metatype) {
      return;
    }

    const controllerName = wrapper.metatype.name;
    const controllerId = `controller:${moduleName}:${controllerName}`;
    const controllerPath = this.reflector.get<string>(PATH_METADATA, wrapper.metatype) || '';

    // Skip GraphStudioController to avoid showing internal routes in the UI
    const isGraphStudioController = controllerName === 'GraphStudioController';

    // Add controller node only if it doesn't already exist
    const controllerExists = nodes.some(node => node.id === controllerId);
    if (!controllerExists) {
      nodes.push({
        id: controllerId,
        name: controllerName,
        type: 'CONTROLLER',
        module: moduleName,
      });
      stats.controllers++;

      // Link controller to module
      edges.push({
        from: moduleId,
        to: controllerId,
        kind: 'export',
      });
    }

    // Collect routes (only if controller was added and not GraphStudioController)
    if (!controllerExists && !isGraphStudioController) {
      const prototype = wrapper.metatype.prototype;
      const methodNames = Object.getOwnPropertyNames(prototype).filter(
        (name) => name !== 'constructor' && typeof prototype[name] === 'function',
      );

      for (const methodName of methodNames) {
        const methodValue = this.reflector.get<number>(METHOD_METADATA, prototype[methodName]);
        const path = this.reflector.get<string>(PATH_METADATA, prototype[methodName]);

        if (methodValue !== undefined && path !== undefined) {
          // Convert method enum to string
          const method = METHOD_MAP[methodValue] || 'UNKNOWN';
          const fullPath = this.normalizePath(controllerPath, path);
          const routeId = `route:${method}:${fullPath}`;

          nodes.push({
            id: routeId,
            name: `${method} ${fullPath}`,
            type: 'ROUTE',
            module: moduleName,
            route: { method, path: fullPath },
          });
          stats.routes++;

          // Link route to controller
          edges.push({
            from: controllerId,
            to: routeId,
            kind: 'handles',
          });

          // Collect execution chain
          const chain = this.collectChain(wrapper.metatype, prototype[methodName]);
          routes.push({
            method,
            path: fullPath,
            controller: controllerName,
            handler: methodName,
            chain,
          });
        }
      }
    }
  }

  private collectChain(controllerClass: any, handlerMethod: any): RouteChain {
    const classGuards = this.reflector.get<any[]>(GUARDS_METADATA, controllerClass) || [];
    const methodGuards = this.reflector.get<any[]>(GUARDS_METADATA, handlerMethod) || [];

    const classPipes = this.reflector.get<any[]>(PIPES_METADATA, controllerClass) || [];
    const methodPipes = this.reflector.get<any[]>(PIPES_METADATA, handlerMethod) || [];

    const classInterceptors = this.reflector.get<any[]>(INTERCEPTORS_METADATA, controllerClass) || [];
    const methodInterceptors = this.reflector.get<any[]>(INTERCEPTORS_METADATA, handlerMethod) || [];

    const classFilters = this.reflector.get<any[]>(EXCEPTION_FILTERS_METADATA, controllerClass) || [];
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

  private getScopeName(scope: any): 'SINGLETON' | 'REQUEST' | 'TRANSIENT' {
    if (scope === undefined || scope === null) {
      return 'SINGLETON';
    }
    // NestJS scope enum values:
    // Scope.DEFAULT = 0, Scope.TRANSIENT = 1, Scope.REQUEST = 2
    if (scope === 1) return 'TRANSIENT';
    if (scope === 2) return 'REQUEST';
    return 'SINGLETON';
  }

  private normalizePath(base: string, path: string): string {
    const normalized = `/${base}/${path}`.replace(/\/+/g, '/').replace(/\/$/, '');
    return normalized || '/';
  }

  /**
   * Collect dependency injection edges between providers and controllers
   */
  private collectDependencies(
    moduleRef: Module,
    edges: GraphEdge[],
    nodes: GraphNode[],
    missingDeps: Map<string, Set<string>>,
  ): void {
    const moduleName = moduleRef.metatype?.name || 'UnknownModule';

    // Collect provider dependencies
    for (const [, wrapper] of moduleRef.providers) {
      this.collectProviderDependencies(wrapper, moduleName, edges, nodes, missingDeps);
    }

    // Collect controller dependencies
    for (const [, wrapper] of moduleRef.controllers) {
      this.collectProviderDependencies(wrapper, moduleName, edges, nodes, missingDeps);
    }
  }

  /**
   * Collect dependencies for a single provider or controller
   */
  private collectProviderDependencies(
    wrapper: InstanceWrapper,
    moduleName: string,
    edges: GraphEdge[],
    _nodes: GraphNode[],
    missingDeps: Map<string, Set<string>>,
  ): void {
    if (!wrapper.metatype) {
      return;
    }

    const isController = wrapper.metatype.toString().includes('Controller');
    const name = wrapper.name || wrapper.metatype.name || 'Unknown';
    const fromId = isController
      ? `controller:${moduleName}:${name}`
      : `provider:${moduleName}:${name}`;

    // Get dependencies from NestJS metadata (handles forwardRef)
    // SELF_DECLARED_DEPS_METADATA contains dependencies declared with @Inject()
    const selfDeclaredDeps = Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, wrapper.metatype) || [];

    // Get constructor parameter types using TypeScript metadata
    const paramTypes = Reflect.getMetadata(PARAMTYPES_METADATA, wrapper.metatype) ||
                       Reflect.getMetadata('design:paramtypes', wrapper.metatype) || [];

    // Merge both sources of dependency information
    const dependencies: any[] = [];

    // Build a map of self-declared deps by index
    const selfDeclaredMap = new Map<number, any>();
    for (const item of selfDeclaredDeps) {
      if (item && typeof item === 'object' && item.index !== undefined) {
        selfDeclaredMap.set(item.index, item.param);
      }
    }

    // Merge dependencies from both sources
    for (let i = 0; i < Math.max(selfDeclaredMap.size, paramTypes.length); i++) {
      // Prefer self-declared deps (from @Inject) over param types
      const dep = selfDeclaredMap.has(i) ? selfDeclaredMap.get(i) : paramTypes[i];
      if (dep) {
        dependencies.push(dep);
      }
    }

    // Iterate through dependencies
    for (let dep of dependencies) {
      // Handle forwardRef - extract the actual type
      if (dep && typeof dep === 'object' && dep.forwardRef) {
        dep = dep.forwardRef();
      }

      // Skip if dependency is undefined or null
      if (!dep) {
        continue;
      }

      // Get dependency name - handle both class constructors and string tokens
      let dependencyName: string;
      if (typeof dep === 'string') {
        // String token (e.g., @Inject('LOGGER_SERVICE'))
        dependencyName = dep;
      } else if (typeof dep === 'function' && dep.name) {
        // Class constructor
        dependencyName = dep.name;
      } else {
        // Unknown dependency type, skip
        continue;
      }

      // Try to find the dependency in all modules
      let foundDependency = false;

      // For string tokens, check if they're provided anywhere
      if (typeof dep === 'string') {
        // String tokens are typically provided with { provide: 'TOKEN', useClass/useValue/... }
        // We need to check the provider's token/name
        for (const [, depModuleRef] of this.modulesContainer.entries()) {
          const depModuleName = depModuleRef.metatype?.name || 'UnknownModule';

          for (const [providerToken] of depModuleRef.providers) {
            // Check if the provider token matches the string dependency
            if (providerToken === dependencyName ||
                (typeof providerToken === 'string' && providerToken === dependencyName)) {
              const toId = `provider:${depModuleName}:${dependencyName}`;
              edges.push({
                from: fromId,
                to: toId,
                kind: 'injects',
              });
              foundDependency = true;
              break;
            }
          }

          if (foundDependency) break;
        }
      } else {
        // For class constructors, use the existing logic
        for (const [, depModuleRef] of this.modulesContainer.entries()) {
          const depModuleName = depModuleRef.metatype?.name || 'UnknownModule';

          // Check in providers
          for (const [, depWrapper] of depModuleRef.providers) {
            const depName = depWrapper.name || depWrapper.metatype?.name;
            if (depName === dependencyName) {
              const toId = `provider:${depModuleName}:${depName}`;
              edges.push({
                from: fromId,
                to: toId,
                kind: 'injects',
              });
              foundDependency = true;
              break;
            }
          }

          if (foundDependency) break;

          // Check in controllers (in case a controller injects another controller)
          for (const [, depWrapper] of depModuleRef.controllers) {
            const depName = depWrapper.name || depWrapper.metatype?.name;
            if (depName === dependencyName) {
              const toId = `controller:${depModuleName}:${depName}`;
              edges.push({
                from: fromId,
                to: toId,
                kind: 'injects',
              });
              foundDependency = true;
              break;
            }
          }

          if (foundDependency) break;
        }
      }

      // If dependency was not found, track it as missing
      if (!foundDependency) {
        if (!missingDeps.has(dependencyName)) {
          missingDeps.set(dependencyName, new Set());
        }
        missingDeps.get(dependencyName)!.add(fromId);
      }
    }
  }
}

