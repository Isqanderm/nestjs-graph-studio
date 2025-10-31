import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import RoutesView from '../RoutesView';
import * as api from '../../api';

// Mock the API module
vi.mock('../../api', () => ({
  fetchRoutes: vi.fn(),
}));

describe('RoutesView - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock response
    vi.mocked(api.fetchRoutes).mockResolvedValue({ routes: [] });
  });

  describe('Empty States', () => {
    it('should display empty table when no routes', async () => {
      vi.mocked(api.fetchRoutes).mockResolvedValue({ routes: [] });

      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Table should be empty
      const tbody = document.querySelector('tbody');
      expect(tbody?.children.length).toBe(0);
    });

    it('should show loading state initially', () => {
      vi.mocked(api.fetchRoutes).mockImplementation(() => new Promise(() => {}));

      render(<RoutesView />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Large Route Lists', () => {
    it('should handle many routes efficiently', async () => {
      const manyRoutes = Array.from({ length: 500 }, (_, i) => ({
        method: i % 2 === 0 ? 'GET' : 'POST',
        path: `/test/${i}`,
        controller: `Controller${i}`,
        handler: `handler${i}`,
        chain: {
          guards: [],
          pipes: [],
          interceptors: [],
          filters: [],
        },
      }));

      vi.mocked(api.fetchRoutes).mockResolvedValue({ routes: manyRoutes });

      const { container } = render(<RoutesView />);

      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });
  });

  describe('Route Paths', () => {
    it('should handle routes with path parameters', async () => {
      const routes = [
        {
          method: 'GET',
          path: '/users/:id',
          controller: 'UsersController',
          handler: 'findOne',
          chain: { guards: [], pipes: [], interceptors: [], filters: [] },
        },
        {
          method: 'GET',
          path: '/posts/:postId/comments/:commentId',
          controller: 'CommentsController',
          handler: 'findOne',
          chain: { guards: [], pipes: [], interceptors: [], filters: [] },
        },
        {
          method: 'GET',
          path: '/files/*',
          controller: 'FilesController',
          handler: 'serve',
          chain: { guards: [], pipes: [], interceptors: [], filters: [] },
        },
      ];

      vi.mocked(api.fetchRoutes).mockResolvedValue({ routes });
      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.getByText('/users/:id')).toBeInTheDocument();
      });
      expect(screen.getByText('/posts/:postId/comments/:commentId')).toBeInTheDocument();
      expect(screen.getByText('/files/*')).toBeInTheDocument();
    });

    it('should handle routes with special characters', async () => {
      const routes = [
        {
          method: 'GET',
          path: '/api/v1/users',
          controller: 'UsersController',
          handler: 'findAll',
          chain: { guards: [], pipes: [], interceptors: [], filters: [] },
        },
      ];

      vi.mocked(api.fetchRoutes).mockResolvedValue({ routes });
      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.getByText('/api/v1/users')).toBeInTheDocument();
      });
    });
  });

  describe('HTTP Methods', () => {
    it('should handle all HTTP methods', async () => {
      const routes = [
        {
          method: 'GET',
          path: '/test',
          controller: 'TestController',
          handler: 'get',
          chain: { guards: [], pipes: [], interceptors: [], filters: [] },
        },
        {
          method: 'POST',
          path: '/test',
          controller: 'TestController',
          handler: 'post',
          chain: { guards: [], pipes: [], interceptors: [], filters: [] },
        },
        {
          method: 'PUT',
          path: '/test',
          controller: 'TestController',
          handler: 'put',
          chain: { guards: [], pipes: [], interceptors: [], filters: [] },
        },
        {
          method: 'DELETE',
          path: '/test',
          controller: 'TestController',
          handler: 'delete',
          chain: { guards: [], pipes: [], interceptors: [], filters: [] },
        },
        {
          method: 'PATCH',
          path: '/test',
          controller: 'TestController',
          handler: 'patch',
          chain: { guards: [], pipes: [], interceptors: [], filters: [] },
        },
        {
          method: 'OPTIONS',
          path: '/test',
          controller: 'TestController',
          handler: 'options',
          chain: { guards: [], pipes: [], interceptors: [], filters: [] },
        },
        {
          method: 'HEAD',
          path: '/test',
          controller: 'TestController',
          handler: 'head',
          chain: { guards: [], pipes: [], interceptors: [], filters: [] },
        },
      ];

      vi.mocked(api.fetchRoutes).mockResolvedValue({ routes });
      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.getByText('GET')).toBeInTheDocument();
      });
      expect(screen.getByText('POST')).toBeInTheDocument();
      expect(screen.getByText('PUT')).toBeInTheDocument();
      expect(screen.getByText('DELETE')).toBeInTheDocument();
      expect(screen.getByText('PATCH')).toBeInTheDocument();
      expect(screen.getByText('OPTIONS')).toBeInTheDocument();
      expect(screen.getByText('HEAD')).toBeInTheDocument();
    });
  });

  describe('Execution Chain', () => {
    it('should handle routes with complex execution chains', async () => {
      const routes = [
        {
          method: 'POST',
          path: '/users',
          controller: 'UsersController',
          handler: 'create',
          chain: {
            guards: ['AuthGuard', 'RolesGuard', 'ThrottlerGuard'],
            pipes: ['ValidationPipe', 'TransformPipe'],
            interceptors: ['LoggingInterceptor', 'CacheInterceptor', 'TimeoutInterceptor'],
            filters: ['HttpExceptionFilter', 'AllExceptionsFilter'],
          },
        },
      ];

      vi.mocked(api.fetchRoutes).mockResolvedValue({ routes });
      const user = userEvent.setup();
      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.getByText('/users')).toBeInTheDocument();
      });

      // Click Details button to see execution chain
      const detailsButton = screen.getByText('Details');
      await user.click(detailsButton);

      await waitFor(() => {
        expect(screen.getByText(/AuthGuard/)).toBeInTheDocument();
      });
      expect(screen.getByText(/ValidationPipe/)).toBeInTheDocument();
      expect(screen.getByText(/LoggingInterceptor/)).toBeInTheDocument();
      expect(screen.getByText(/HttpExceptionFilter/)).toBeInTheDocument();
    });

    it('should handle routes with empty execution chains', async () => {
      const routes = [
        {
          method: 'GET',
          path: '/health',
          controller: 'HealthController',
          handler: 'check',
          chain: {
            guards: [],
            pipes: [],
            interceptors: [],
            filters: [],
          },
        },
      ];

      vi.mocked(api.fetchRoutes).mockResolvedValue({ routes });
      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.getByText('/health')).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filter', () => {
    it('should filter routes with no results', async () => {
      const routes = [
        {
          method: 'GET',
          path: '/test',
          controller: 'TestController',
          handler: 'test',
          chain: { guards: [], pipes: [], interceptors: [], filters: [] },
        },
      ];

      vi.mocked(api.fetchRoutes).mockResolvedValue({ routes });
      const user = userEvent.setup();
      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.getByText('/test')).toBeInTheDocument();
      });

      const filterInput = screen.getByPlaceholderText(/filter routes/i);
      await user.type(filterInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.queryByText('/test')).not.toBeInTheDocument();
      });
    });

    it('should handle case-insensitive filtering', async () => {
      const routes = [
        {
          method: 'GET',
          path: '/TEST',
          controller: 'TestController',
          handler: 'test',
          chain: { guards: [], pipes: [], interceptors: [], filters: [] },
        },
      ];

      vi.mocked(api.fetchRoutes).mockResolvedValue({ routes });
      const user = userEvent.setup();
      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.getByText('/TEST')).toBeInTheDocument();
      });

      const filterInput = screen.getByPlaceholderText(/filter routes/i);
      await user.type(filterInput, 'test');

      await waitFor(() => {
        expect(screen.getByText('/TEST')).toBeInTheDocument();
      });
    });

    it('should filter across method, path, controller, and handler', async () => {
      const routes = [
        {
          method: 'GET',
          path: '/users',
          controller: 'UsersController',
          handler: 'findAll',
          chain: { guards: [], pipes: [], interceptors: [], filters: [] },
        },
        {
          method: 'POST',
          path: '/posts',
          controller: 'PostsController',
          handler: 'create',
          chain: { guards: [], pipes: [], interceptors: [], filters: [] },
        },
        {
          method: 'GET',
          path: '/comments',
          controller: 'CommentsController',
          handler: 'findAll',
          chain: { guards: [], pipes: [], interceptors: [], filters: [] },
        },
        {
          method: 'DELETE',
          path: '/admin/users',
          controller: 'AdminController',
          handler: 'deleteUser',
          chain: { guards: [], pipes: [], interceptors: [], filters: [] },
        },
      ];

      vi.mocked(api.fetchRoutes).mockResolvedValue({ routes });
      const user = userEvent.setup();
      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.getByText('/users')).toBeInTheDocument();
      });

      // Filter by method
      const filterInput = screen.getByPlaceholderText(/filter routes/i);
      await user.clear(filterInput);
      await user.type(filterInput, 'POST');
      await waitFor(() => {
        expect(screen.getByText('/posts')).toBeInTheDocument();
        expect(screen.queryByText('/users')).not.toBeInTheDocument();
      });

      // Filter by path
      await user.clear(filterInput);
      await user.type(filterInput, 'admin');
      await waitFor(() => {
        expect(screen.getByText('/admin/users')).toBeInTheDocument();
        expect(screen.queryByText('/posts')).not.toBeInTheDocument();
      });

      // Filter by controller
      await user.clear(filterInput);
      await user.type(filterInput, 'Comments');
      await waitFor(() => {
        expect(screen.getByText('/comments')).toBeInTheDocument();
        expect(screen.queryByText('/admin/users')).not.toBeInTheDocument();
      });
    });
  });
});

