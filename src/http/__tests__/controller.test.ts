/**
 * Tests for GraphStudioController
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GraphStudioController } from '../controller';
import { SnapshotCollector } from '../../snapshot/collector';

// Mock dependencies using vi.hoisted
const {
  mockEventBus,
  mockServeStatic,
  mockIsExpress,
  mockSetSseHeadersExpress,
  mockWriteSseEventExpress,
  mockWriteSseCommentExpress,
  mockSetSseHeadersFastify,
  mockWriteSseEventFastify,
  mockWriteSseCommentFastify,
} = vi.hoisted(() => {
  return {
    mockEventBus: {
      emit: vi.fn(),
      subscribe: vi.fn(() => vi.fn()), // Returns unsubscribe function
      getRecentEvents: vi.fn(() => []),
      getSubscriberCount: vi.fn(() => 0),
      clearEvents: vi.fn(),
    },
    mockServeStatic: vi.fn((req, res, _basePath) => {
      if (req.url === '/index.html') {
        res.status(200).send('<html></html>');
        return true;
      }
      return false;
    }),
    mockIsExpress: vi.fn((app) => app?.express === true),
    mockSetSseHeadersExpress: vi.fn(),
    mockWriteSseEventExpress: vi.fn(),
    mockWriteSseCommentExpress: vi.fn(),
    mockSetSseHeadersFastify: vi.fn(),
    mockWriteSseEventFastify: vi.fn(),
    mockWriteSseCommentFastify: vi.fn(),
  };
});

vi.mock('../../tracing/bus', () => ({
  getEventBus: vi.fn(() => mockEventBus),
}));

vi.mock('../static', () => ({
  serveStatic: mockServeStatic,
}));

vi.mock('../../adapters/express', () => ({
  isExpress: mockIsExpress,
  setSseHeaders: mockSetSseHeadersExpress,
  writeSseEvent: mockWriteSseEventExpress,
  writeSseComment: mockWriteSseCommentExpress,
}));

vi.mock('../../adapters/fastify', () => ({
  isFastify: vi.fn((app) => app?.fastify === true),
  setSseHeaders: mockSetSseHeadersFastify,
  writeSseEvent: mockWriteSseEventFastify,
  writeSseComment: mockWriteSseCommentFastify,
}));

describe('GraphStudioController', () => {
  let controller: GraphStudioController;
  let mockCollector: SnapshotCollector;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCollector = {
      collect: vi.fn(() => ({
        nodes: [
          { id: 'node1', label: 'TestController', type: 'controller' },
          { id: 'node2', label: 'TestService', type: 'provider' },
        ],
        edges: [
          { source: 'node1', target: 'node2', label: 'depends on' },
        ],
        routes: [
          { path: '/test', method: 'GET', controller: 'TestController', handler: 'getTest' },
        ],
        stats: {
          controllers: 1,
          providers: 1,
          modules: 1,
          routes: 1,
        },
      })),
    } as any;

    controller = new GraphStudioController(mockCollector);
  });

  describe('getGraph', () => {
    it('should return graph snapshot from collector', () => {
      const result = controller.getGraph();

      expect(mockCollector.collect).toHaveBeenCalled();
      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
      expect(result.routes).toHaveLength(1);
      expect(result.stats).toBeDefined();
    });

    it('should return nodes with correct structure', () => {
      const result = controller.getGraph();

      expect(result.nodes[0]).toEqual({
        id: 'node1',
        label: 'TestController',
        type: 'controller',
      });
    });

    it('should return edges with correct structure', () => {
      const result = controller.getGraph();

      expect(result.edges[0]).toEqual({
        source: 'node1',
        target: 'node2',
        label: 'depends on',
      });
    });
  });

  describe('getRoutes', () => {
    it('should return routes and stats from snapshot', () => {
      const result = controller.getRoutes();

      expect(mockCollector.collect).toHaveBeenCalled();
      expect(result.routes).toHaveLength(1);
      expect(result.stats).toBeDefined();
    });

    it('should return only routes and stats, not full graph', () => {
      const result = controller.getRoutes();

      expect(result).toHaveProperty('routes');
      expect(result).toHaveProperty('stats');
      expect(result).not.toHaveProperty('nodes');
      expect(result).not.toHaveProperty('edges');
    });

    it('should return route with correct structure', () => {
      const result = controller.getRoutes();

      expect(result.routes[0]).toEqual({
        path: '/test',
        method: 'GET',
        controller: 'TestController',
        handler: 'getTest',
      });
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = controller.getHealth();

      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
    });

    it('should return current timestamp in ISO format', () => {
      const result = controller.getHealth();

      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('serveUiRoot', () => {
    it('should serve UI', () => {
      const req = { url: '/index.html' };
      const res = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      controller.serveUi(req, res);

      expect(mockServeStatic).toHaveBeenCalledWith(req, res, '/graph-studio');
    });

    it('should return 404 when static file not found', () => {
      mockServeStatic.mockReturnValue(false);

      const req = { url: '/nonexistent.html' };
      const res = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      controller.serveUi(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Not Found');
    });
  });

  describe('serveUiRoot (root path)', () => {
    it('should serve UI root', () => {
      const req = { url: '/graph-studio' };
      const res = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      controller.serveUiRoot(req, res);

      expect(mockServeStatic).toHaveBeenCalledWith(req, res, '/graph-studio');
    });

    it('should return 404 when file not found', () => {
      mockServeStatic.mockReturnValue(false);

      const req = { url: '/graph-studio' };
      const res = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      controller.serveUiRoot(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Not Found');
    });
  });

  describe('serveUi (catch-all)', () => {
    it('should serve UI files', () => {
      const req = { url: '/assets/main.js' };
      const res = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      controller.serveUi(req, res);

      expect(mockServeStatic).toHaveBeenCalledWith(req, res, '/graph-studio');
    });

    it('should return 404 when file not found', () => {
      mockServeStatic.mockReturnValue(false);

      const req = { url: '/missing-file.css' };
      const res = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      controller.serveUi(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Not Found');
    });
  });
});

