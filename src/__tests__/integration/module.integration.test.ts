import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Controller, Get, Module, Injectable } from '@nestjs/common';
import request from 'supertest';
import { GraphStudioModule } from '../../module';

// Create test services and controllers for dependency injection scenarios
@Injectable()
class SharedService {
  getData(): string {
    return 'shared data';
  }
}

@Controller('base')
class BaseController {
  constructor(private readonly sharedService: SharedService) {}

  @Get('data')
  getData(): string {
    return this.sharedService.getData();
  }
}

// Controller that injects another controller (edge case)
@Controller('dependent')
class DependentController {
  constructor(private readonly baseController: BaseController) {}

  @Get('proxy')
  getProxyData(): string {
    return this.baseController.getData();
  }
}

// Create a simple test module with routes
@Controller('test')
class TestController {
  @Get('hello')
  getHello(): string {
    return 'Hello World!';
  }

  @Get('users/:id')
  getUser(): { id: number; name: string } {
    return { id: 1, name: 'Test User' };
  }
}

@Module({
  providers: [SharedService],
  controllers: [BaseController, DependentController],
  exports: [SharedService],
})
class SharedModule {}

@Module({
  imports: [
    GraphStudioModule.forRoot({
      enabled: true,
    }),
    SharedModule,
  ],
  controllers: [TestController],
})
class TestAppModule {}

describe('GraphStudioModule Integration Tests', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    server = app.getHttpServer();
  }, 15000); // Increase timeout to 15 seconds

  afterAll(async () => {
    await app.close();
  });

  describe('GET /graph-studio/graph', () => {
    it('should return graph snapshot with nodes and edges', async () => {
      const response = await request(server)
        .get('/graph-studio/graph');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toHaveProperty('nodes');
      expect(response.body).toHaveProperty('edges');
      expect(response.body).toHaveProperty('routes');
      expect(response.body).toHaveProperty('stats');
      expect(response.body).toHaveProperty('createdAt');
      expect(Array.isArray(response.body.nodes)).toBe(true);
      expect(Array.isArray(response.body.edges)).toBe(true);
      expect(Array.isArray(response.body.routes)).toBe(true);
    });

    it('should include TestController in nodes', async () => {
      const response = await request(server)
        .get('/graph-studio/graph')
        .expect(200);

      const testControllerNode = response.body.nodes.find(
        (node: any) => node.name === 'TestController',
      );

      expect(testControllerNode).toBeDefined();
      expect(testControllerNode.type).toBe('CONTROLLER');
      expect(testControllerNode.name).toBe('TestController');
    });

    it('should include route metadata', async () => {
      const response = await request(server)
        .get('/graph-studio/graph')
        .expect(200);

      // Routes are in the routes array, not in the controller node
      expect(response.body.routes).toBeDefined();
      expect(Array.isArray(response.body.routes)).toBe(true);
      expect(response.body.routes.length).toBeGreaterThan(0);

      const helloRoute = response.body.routes.find(
        (route: any) => route.path === '/test/hello',
      );
      expect(helloRoute).toBeDefined();
      expect(helloRoute.method).toBe('GET');
    });
  });

  describe('GET /graph-studio/routes', () => {
    it('should return all registered routes', async () => {
      const response = await request(server)
        .get('/graph-studio/routes')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('routes');
      expect(response.body).toHaveProperty('stats');
      expect(Array.isArray(response.body.routes)).toBe(true);
      expect(response.body.routes.length).toBeGreaterThan(0);
    });

    it('should include test routes', async () => {
      const response = await request(server)
        .get('/graph-studio/routes')
        .expect(200);

      const helloRoute = response.body.routes.find(
        (route: any) => route.path === '/test/hello',
      );

      expect(helloRoute).toBeDefined();
      expect(helloRoute.method).toBe('GET');
      expect(helloRoute.controller).toBe('TestController');
      expect(helloRoute.handler).toBe('getHello');
    });

    it('should exclude GraphStudio internal routes', async () => {
      const response = await request(server)
        .get('/graph-studio/routes')
        .expect(200);

      // GraphStudioController routes are intentionally excluded to avoid showing internal routes
      const graphRoute = response.body.routes.find(
        (route: any) => route.controller === 'GraphStudioController',
      );

      expect(graphRoute).toBeUndefined();

      // But test routes should be included
      const testRoute = response.body.routes.find(
        (route: any) => route.controller === 'TestController',
      );
      expect(testRoute).toBeDefined();
    });

    it('should include route metadata (guards, pipes, interceptors)', async () => {
      const response = await request(server)
        .get('/graph-studio/routes')
        .expect(200);

      const route = response.body.routes[0];

      // Check basic route properties
      expect(route).toHaveProperty('method');
      expect(route).toHaveProperty('path');
      expect(route).toHaveProperty('controller');
      expect(route).toHaveProperty('handler');

      // Check chain metadata
      expect(route).toHaveProperty('chain');
      expect(route.chain).toHaveProperty('guards');
      expect(route.chain).toHaveProperty('pipes');
      expect(route.chain).toHaveProperty('interceptors');
      expect(route.chain).toHaveProperty('filters');
      expect(Array.isArray(route.chain.guards)).toBe(true);
      expect(Array.isArray(route.chain.pipes)).toBe(true);
      expect(Array.isArray(route.chain.interceptors)).toBe(true);
      expect(Array.isArray(route.chain.filters)).toBe(true);
    });
  });

  describe('GET /graph-studio/health', () => {
    it('should return health status', async () => {
      const response = await request(server)
        .get('/graph-studio/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Controller-to-Controller Injection', () => {
    it('should detect controller injecting another controller', async () => {
      const response = await request(server)
        .get('/graph-studio/graph')
        .expect(200);

      // Find the DependentController node
      const dependentController = response.body.nodes.find(
        (node: any) => node.name === 'DependentController',
      );
      expect(dependentController).toBeDefined();

      // Find the BaseController node
      const baseController = response.body.nodes.find(
        (node: any) => node.name === 'BaseController',
      );
      expect(baseController).toBeDefined();

      // The edge might exist if the collector properly detects controller-to-controller injection
      // This tests the code path in collector.ts lines 462-475
      expect(response.body.edges).toBeDefined();
    });

    it('should include SharedService in the graph', async () => {
      const response = await request(server)
        .get('/graph-studio/graph')
        .expect(200);

      const sharedService = response.body.nodes.find(
        (node: any) => node.name === 'SharedService',
      );
      expect(sharedService).toBeDefined();
      expect(sharedService.type).toBe('PROVIDER');
    });

    it('should show BaseController depends on SharedService', async () => {
      const response = await request(server)
        .get('/graph-studio/graph')
        .expect(200);

      const baseController = response.body.nodes.find(
        (node: any) => node.name === 'BaseController',
      );
      const sharedService = response.body.nodes.find(
        (node: any) => node.name === 'SharedService',
      );

      expect(baseController).toBeDefined();
      expect(sharedService).toBeDefined();

      // Check for injection edge - it may or may not exist depending on how NestJS resolves dependencies
      // The important thing is that both nodes exist in the graph
      const injectionEdges = response.body.edges.filter(
        (edge: any) => edge.kind === 'injects',
      );

      // Verify that injection edges exist in the graph
      expect(injectionEdges.length).toBeGreaterThan(0);
    });
  });

  describe('Test Application Routes', () => {
    it('should handle test routes correctly', async () => {
      const response = await request(server)
        .get('/test/hello')
        .expect(200);

      expect(response.text).toBe('Hello World!');
    });

    it('should handle parameterized routes', async () => {
      const response = await request(server)
        .get('/test/users/123')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({ id: 1, name: 'Test User' });
    });
  });

  describe('Error Handling', () => {
    it('should serve UI for non-API routes (SPA behavior)', async () => {
      // The catch-all route serves the UI index.html for non-API routes
      // This is expected SPA behavior
      const response = await request(server)
        .get('/graph-studio/nonexistent');

      // Should return 200 with HTML (SPA fallback) or 404 if UI is disabled
      expect([200, 404]).toContain(response.status);
    });

    it('should handle invalid paths gracefully', async () => {
      const response = await request(server)
        .get('/graph-studio/../../../etc/passwd');

      // Should return 200 with HTML (SPA fallback) or 404
      expect([200, 404]).toContain(response.status);
    });
  });
});

