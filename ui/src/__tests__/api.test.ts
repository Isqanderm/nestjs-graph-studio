import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchGraph, fetchRoutes, fetchHealth } from '../api';

describe('API Client', () => {
  const originalFetch = global.fetch;
  const mockFetch = vi.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockClear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('fetchGraph', () => {
    it('should fetch graph data successfully', async () => {
      const mockGraphData = {
        createdAt: '2024-01-01T00:00:00Z',
        stats: { modules: 5, providers: 10, controllers: 3, routes: 15 },
        nodes: [
          { id: 'node1', name: 'TestModule', type: 'MODULE' as const },
          { id: 'node2', name: 'TestService', type: 'PROVIDER' as const },
        ],
        edges: [
          { from: 'node1', to: 'node2', kind: 'export' as const },
        ],
        routes: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGraphData,
      });

      const result = await fetchGraph();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/graph-studio/graph')
      );
      expect(result).toEqual(mockGraphData);
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(fetchGraph()).rejects.toThrow(
        'Failed to fetch graph: Internal Server Error'
      );
    });

    it('should throw error when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(fetchGraph()).rejects.toThrow(
        'Failed to fetch graph: Not Found'
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchGraph()).rejects.toThrow('Network error');
    });

    it('should handle JSON parse errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(fetchGraph()).rejects.toThrow('Invalid JSON');
    });
  });

  describe('fetchRoutes', () => {
    it('should fetch routes data successfully', async () => {
      const mockRoutesData = {
        routes: [
          {
            method: 'GET',
            path: '/api/users',
            controller: 'UsersController',
            handler: 'getUsers',
            chain: {
              guards: ['AuthGuard'],
              pipes: [],
              interceptors: ['LoggingInterceptor'],
              filters: [],
            },
          },
          {
            method: 'POST',
            path: '/api/users',
            controller: 'UsersController',
            handler: 'createUser',
            chain: {
              guards: ['AuthGuard'],
              pipes: ['ValidationPipe'],
              interceptors: [],
              filters: [],
            },
          },
        ],
        stats: {
          totalRoutes: 2,
          controllers: 1,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoutesData,
      });

      const result = await fetchRoutes();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/graph-studio/routes')
      );
      expect(result).toEqual(mockRoutesData);
      expect(result.routes).toHaveLength(2);
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Service Unavailable',
      });

      await expect(fetchRoutes()).rejects.toThrow(
        'Failed to fetch routes: Service Unavailable'
      );
    });

    it('should throw error when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Forbidden',
      });

      await expect(fetchRoutes()).rejects.toThrow(
        'Failed to fetch routes: Forbidden'
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection timeout'));

      await expect(fetchRoutes()).rejects.toThrow('Connection timeout');
    });

    it('should handle empty routes array', async () => {
      const mockRoutesData = {
        routes: [],
        stats: {
          totalRoutes: 0,
          controllers: 0,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoutesData,
      });

      const result = await fetchRoutes();

      expect(result.routes).toEqual([]);
      expect(result.stats.totalRoutes).toBe(0);
    });
  });

  describe('fetchHealth', () => {
    it('should fetch health data successfully', async () => {
      const mockHealthData = {
        status: 'ok',
        uptime: 12345,
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockHealthData,
      });

      const result = await fetchHealth();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/graph-studio/health')
      );
      expect(result).toEqual(mockHealthData);
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Gateway',
      });

      await expect(fetchHealth()).rejects.toThrow(
        'Failed to fetch health: Bad Gateway'
      );
    });

    it('should throw error when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      await expect(fetchHealth()).rejects.toThrow(
        'Failed to fetch health: Unauthorized'
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('DNS resolution failed'));

      await expect(fetchHealth()).rejects.toThrow('DNS resolution failed');
    });

    it('should handle different health statuses', async () => {
      const mockHealthData = {
        status: 'degraded',
        uptime: 12345,
        timestamp: '2024-01-01T00:00:00Z',
        issues: ['Database connection slow'],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockHealthData,
      });

      const result = await fetchHealth();

      expect(result.status).toBe('degraded');
      expect(result.issues).toBeDefined();
    });
  });

  describe('BASE_URL construction', () => {
    it('should use correct base URL from window.location.origin', async () => {
      const mockGraphData = {
        createdAt: '2024-01-01T00:00:00Z',
        stats: { modules: 0, providers: 0, controllers: 0, routes: 0 },
        nodes: [],
        edges: [],
        routes: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGraphData,
      });

      await fetchGraph();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/graph-studio\/graph$/)
      );
    });
  });
});

