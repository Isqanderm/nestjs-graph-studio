/**
 * Tests for GraphStudioModule
 */

import { describe, it, expect, vi } from 'vitest';
import { GraphStudioModule } from '../module';
import { GRAPH_STUDIO_OPTIONS } from '../constants';
import { SnapshotCollector } from '../snapshot/collector';
import { GraphStudioController } from '../http/controller';

// Mock dependencies using vi.hoisted


describe('GraphStudioModule', () => {
  describe('forRoot', () => {
    it('should create a dynamic module with default options', () => {
      const module = GraphStudioModule.forRoot();

      expect(module.module).toBe(GraphStudioModule);
      expect(module.controllers).toContain(GraphStudioController);
      expect(module.providers).toBeDefined();
      expect(module.exports).toContain(GRAPH_STUDIO_OPTIONS);
      expect(module.exports).toContain(SnapshotCollector);
    });

    it('should create a dynamic module with custom options', () => {
      const module = GraphStudioModule.forRoot({
        healthPath: '/custom-health',
      });

      expect(module.module).toBe(GraphStudioModule);
      expect(module.controllers).toContain(GraphStudioController);

      // Check that options provider is configured
      const optionsProvider = module.providers?.find(
        (p: any) => p.provide === GRAPH_STUDIO_OPTIONS
      );
      expect(optionsProvider).toBeDefined();
      expect((optionsProvider as any).useValue.healthPath).toBe('/custom-health');
    });

    it('should return empty module when disabled', () => {
      const module = GraphStudioModule.forRoot({ enabled: false });

      expect(module.module).toBe(GraphStudioModule);
      expect(module.providers).toEqual([]);
      expect(module.controllers).toEqual([]);
    });

    it('should include all required providers', () => {
      const module = GraphStudioModule.forRoot();

      const providers = module.providers as any[];

      // Check for options provider
      const optionsProvider = providers.find(p => p.provide === GRAPH_STUDIO_OPTIONS);
      expect(optionsProvider).toBeDefined();

      // Check for SnapshotCollector
      expect(providers).toContain(SnapshotCollector);
    });
  });

  describe('forRootAsync', () => {
    it('should create a dynamic module with async factory', () => {
      const module = GraphStudioModule.forRootAsync({
        useFactory: async () => ({
          healthPath: '/async-health',
          enabled: true,
        }),
      });

      expect(module.module).toBe(GraphStudioModule);
      expect(module.controllers).toContain(GraphStudioController);
      expect(module.providers).toBeDefined();
    });

    it('should configure options provider with factory', () => {
      const factory = vi.fn(async () => ({
        healthPath: '/factory-health',
        enabled: true,
      }));

      const module = GraphStudioModule.forRootAsync({
        useFactory: factory,
      });

      const providers = module.providers as any[];
      const optionsProvider = providers.find(p => p.provide === GRAPH_STUDIO_OPTIONS);

      expect(optionsProvider).toBeDefined();
      expect(optionsProvider.useFactory).toBeDefined();
      expect(optionsProvider.inject).toEqual([]);
    });

    it('should support dependency injection in factory', () => {
      const module = GraphStudioModule.forRootAsync({
        useFactory: async (config: any) => ({
          healthPath: config.healthPath,
        }),
        inject: ['CONFIG_SERVICE'],
      });

      const providers = module.providers as any[];
      const optionsProvider = providers.find(p => p.provide === GRAPH_STUDIO_OPTIONS);

      expect(optionsProvider.inject).toEqual(['CONFIG_SERVICE']);
    });

    it('should execute factory function and merge options', async () => {
      const customOptions = {
        healthPath: '/custom-health',
        enabled: true,
      };

      const module = GraphStudioModule.forRootAsync({
        useFactory: async () => customOptions,
      });

      const providers = module.providers as any[];
      const optionsProvider = providers.find(p => p.provide === GRAPH_STUDIO_OPTIONS);

      // Execute the factory function
      const result = await optionsProvider.useFactory();

      // Verify the factory was executed and options were merged
      expect(result).toBeDefined();
      expect(result.healthPath).toBe('/custom-health');
      expect(result.enabled).toBe(true);
    });

    it('should execute factory with injected dependencies', async () => {
      const mockConfigService = { healthPath: '/injected-health', enabled: true };

      const module = GraphStudioModule.forRootAsync({
        useFactory: async (config: any) => ({
          healthPath: config.healthPath,
          enabled: config.enabled,
        }),
        inject: ['CONFIG_SERVICE'],
      });

      const providers = module.providers as any[];
      const optionsProvider = providers.find(p => p.provide === GRAPH_STUDIO_OPTIONS);

      // Execute the factory function with injected dependency
      const result = await optionsProvider.useFactory(mockConfigService);

      // Verify the factory received the injected dependency
      expect(result).toBeDefined();
      expect(result.healthPath).toBe('/injected-health');
      expect(result.enabled).toBe(true);
    });

    it('should include all required providers in async mode', () => {
      const module = GraphStudioModule.forRootAsync({
        useFactory: async () => ({}),
      });

      const providers = module.providers as any[];

      // Check for SnapshotCollector
      expect(providers).toContain(SnapshotCollector);
    });
  });

  describe('configure (middleware)', () => {
    it('should not apply middleware (middleware configuration removed)', () => {
      const consumer = {
        apply: vi.fn().mockReturnThis(),
        forRoutes: vi.fn().mockReturnThis(),
      };

      const module = new GraphStudioModule();

      module.configure(consumer as any);

      // Middleware configuration has been removed
      expect(consumer.apply).not.toHaveBeenCalled();
    });
  });
});

