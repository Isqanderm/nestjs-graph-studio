/**
 * GraphStudioModule - Main module for NestJS integration
 */

import {
  Module,
  DynamicModule,
  MiddlewareConsumer,
  NestModule,
  Provider,
} from '@nestjs/common';
import { DiscoveryModule, Reflector } from '@nestjs/core';
import { GraphStudioOptions, GraphStudioAsyncOptions, mergeOptions } from './options';
import { GRAPH_STUDIO_OPTIONS } from './constants';
import { SnapshotCollector } from './snapshot/collector';
import { GraphStudioController } from './http/controller';

@Module({})
export class GraphStudioModule implements NestModule {
  static forRoot(options: GraphStudioOptions = {}): DynamicModule {
    const mergedOptions = mergeOptions(options);

    if (!mergedOptions.enabled) {
      return {
        module: GraphStudioModule,
        providers: [],
        controllers: [],
      };
    }

    const providers: Provider[] = [
      {
        provide: GRAPH_STUDIO_OPTIONS,
        useValue: mergedOptions,
      },
      Reflector,
      SnapshotCollector,
    ];

    return {
      module: GraphStudioModule,
      imports: [DiscoveryModule],
      providers,
      controllers: [GraphStudioController],
      exports: [GRAPH_STUDIO_OPTIONS, SnapshotCollector],
    };
  }

  static forRootAsync(options: GraphStudioAsyncOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: GRAPH_STUDIO_OPTIONS,
        useFactory: async (...args: any[]) => {
          const opts = await options.useFactory(...args);
          return mergeOptions(opts);
        },
        inject: options.inject || [],
      },
      Reflector,
      SnapshotCollector,
    ];

    return {
      module: GraphStudioModule,
      imports: [DiscoveryModule],
      providers,
      controllers: [GraphStudioController],
      exports: [GRAPH_STUDIO_OPTIONS],
    };
  }

  configure(_consumer: MiddlewareConsumer) {
    // Middleware configuration removed - UI serving is now handled by the controller
  }
}

