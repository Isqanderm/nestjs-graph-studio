import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import RoutesView from '../RoutesView';
import * as api from '../../api';
import { RouteMeta } from '../../types';

// Mock the API module
vi.mock('../../api', () => ({
  fetchRoutes: vi.fn(),
}));

// Helper function to create mock routes
function createMockRoutes(): RouteMeta[] {
  return [
    {
      method: 'GET',
      path: '/users',
      controller: 'UsersController',
      handler: 'findAll',
      chain: {
        guards: ['AuthGuard'],
        pipes: [],
        interceptors: ['LoggingInterceptor'],
        filters: [],
      },
    },
    {
      method: 'POST',
      path: '/users',
      controller: 'UsersController',
      handler: 'create',
      chain: {
        guards: ['AuthGuard'],
        pipes: ['ValidationPipe'],
        interceptors: [],
        filters: [],
      },
    },
    {
      method: 'GET',
      path: '/users/:id',
      controller: 'UsersController',
      handler: 'findOne',
      chain: {
        guards: [],
        pipes: [],
        interceptors: [],
        filters: [],
      },
    },
    {
      method: 'DELETE',
      path: '/users/:id',
      controller: 'UsersController',
      handler: 'remove',
      chain: {
        guards: ['AuthGuard', 'RolesGuard'],
        pipes: [],
        interceptors: [],
        filters: [],
      },
    },
  ];
}

describe('RoutesView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading state initially', () => {
      vi.mocked(api.fetchRoutes).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<RoutesView />);

      expect(screen.getByText(/loading routes/i)).toBeInTheDocument();
    });

    it('should hide loading state after data is fetched', async () => {
      vi.mocked(api.fetchRoutes).mockResolvedValue({
        routes: createMockRoutes(),
      });

      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.queryByText(/loading routes/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Rendering', () => {
    beforeEach(() => {
      vi.mocked(api.fetchRoutes).mockResolvedValue({
        routes: createMockRoutes(),
      });
    });

    it('should render the component with header', async () => {
      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.getByText('Routes')).toBeInTheDocument();
        expect(screen.getByText(/All registered routes/i)).toBeInTheDocument();
      });
    });

    it('should render filter input', async () => {
      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/filter routes/i)).toBeInTheDocument();
      });
    });

    it('should render table headers', async () => {
      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.getByText('Method')).toBeInTheDocument();
        expect(screen.getByText('Path')).toBeInTheDocument();
        expect(screen.getByText('Controller')).toBeInTheDocument();
        expect(screen.getByText('Handler')).toBeInTheDocument();
        expect(screen.getByText('Guards')).toBeInTheDocument();
        expect(screen.getByText('Pipes')).toBeInTheDocument();
        expect(screen.getByText('Interceptors')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();
      });
    });
  });

  describe('Routes Display', () => {
    beforeEach(() => {
      vi.mocked(api.fetchRoutes).mockResolvedValue({
        routes: createMockRoutes(),
      });
    });

    it('should display all routes in table', async () => {
      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.getAllByText('GET').length).toBeGreaterThan(0);
        expect(screen.getByText('POST')).toBeInTheDocument();
        expect(screen.getByText('DELETE')).toBeInTheDocument();
        expect(screen.getAllByText('/users').length).toBeGreaterThan(0);
        expect(screen.getAllByText('/users/:id').length).toBeGreaterThan(0);
      });
    });

    it('should display controller and handler names', async () => {
      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.getAllByText('UsersController').length).toBeGreaterThan(0);
        expect(screen.getByText('findAll')).toBeInTheDocument();
        expect(screen.getByText('create')).toBeInTheDocument();
        expect(screen.getByText('findOne')).toBeInTheDocument();
        expect(screen.getByText('remove')).toBeInTheDocument();
      });
    });

    it('should display chain counts', async () => {
      render(<RoutesView />);

      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toHaveTextContent('1'); // Guards count
        expect(table).toHaveTextContent('2'); // Multiple guards
      });
    });

    it('should display dash for empty chains', async () => {
      render(<RoutesView />);

      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toHaveTextContent('-');
      });
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      vi.mocked(api.fetchRoutes).mockResolvedValue({
        routes: createMockRoutes(),
      });
    });

    it('should filter routes by method', async () => {
      const user = userEvent.setup();

      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.getAllByText('GET').length).toBeGreaterThan(0);
      });

      const filterInput = screen.getByPlaceholderText(/filter routes/i);
      await user.type(filterInput, 'POST');

      await waitFor(() => {
        expect(screen.getByText('POST')).toBeInTheDocument();
        expect(screen.queryByText('DELETE')).not.toBeInTheDocument();
      });
    });

    it('should filter routes by path', async () => {
      const user = userEvent.setup();

      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.getAllByText('/users').length).toBeGreaterThan(0);
      });

      const filterInput = screen.getByPlaceholderText(/filter routes/i);
      await user.type(filterInput, ':id');

      await waitFor(() => {
        expect(screen.getAllByText('/users/:id').length).toBe(2); // GET and DELETE
        const table = screen.getByRole('table');
        expect(table).not.toHaveTextContent('findAll');
        expect(table).not.toHaveTextContent('create');
      });
    });

    it('should filter routes by controller name', async () => {
      const user = userEvent.setup();

      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.getAllByText('UsersController').length).toBeGreaterThan(0);
      });

      const filterInput = screen.getByPlaceholderText(/filter routes/i);
      await user.type(filterInput, 'Users');

      await waitFor(() => {
        expect(screen.getAllByText('UsersController').length).toBeGreaterThan(0);
      });
    });

    it('should filter routes by handler name', async () => {
      const user = userEvent.setup();

      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.getByText('findAll')).toBeInTheDocument();
      });

      const filterInput = screen.getByPlaceholderText(/filter routes/i);
      await user.type(filterInput, 'findAll');

      await waitFor(() => {
        expect(screen.getByText('findAll')).toBeInTheDocument();
        expect(screen.queryByText('create')).not.toBeInTheDocument();
        expect(screen.queryByText('remove')).not.toBeInTheDocument();
      });
    });

    it('should be case-insensitive', async () => {
      const user = userEvent.setup();

      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.getAllByText('GET').length).toBeGreaterThan(0);
      });

      const filterInput = screen.getByPlaceholderText(/filter routes/i);
      await user.type(filterInput, 'get');

      await waitFor(() => {
        expect(screen.getAllByText('GET').length).toBeGreaterThan(0);
      });
    });

    it('should clear filter when input is cleared', async () => {
      const user = userEvent.setup();

      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.getAllByText('GET').length).toBeGreaterThan(0);
      });

      const filterInput = screen.getByPlaceholderText(/filter routes/i);
      await user.type(filterInput, 'POST');

      await waitFor(() => {
        expect(screen.queryByText('DELETE')).not.toBeInTheDocument();
      });

      await user.clear(filterInput);

      await waitFor(() => {
        expect(screen.getAllByText('GET').length).toBeGreaterThan(0);
        expect(screen.getByText('POST')).toBeInTheDocument();
        expect(screen.getByText('DELETE')).toBeInTheDocument();
      });
    });
  });

  describe('GraphStudio Routes Filtering', () => {
    it('should filter out GraphStudioController routes', async () => {
      const routesWithGraphStudio: RouteMeta[] = [
        ...createMockRoutes(),
        {
          method: 'GET',
          path: '/graph-studio/graph',
          controller: 'GraphStudioController',
          handler: 'getGraph',
          chain: {
            guards: [],
            pipes: [],
            interceptors: [],
            filters: [],
          },
        },
      ];

      vi.mocked(api.fetchRoutes).mockResolvedValue({
        routes: routesWithGraphStudio,
      });

      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.queryByText('GraphStudioController')).not.toBeInTheDocument();
        expect(screen.queryByText('/graph-studio/graph')).not.toBeInTheDocument();
      });
    });

    it('should filter out routes with empty paths', async () => {
      const routesWithEmpty: RouteMeta[] = [
        ...createMockRoutes(),
        {
          method: 'GET',
          path: '',
          controller: 'EmptyController',
          handler: 'empty',
          chain: {
            guards: [],
            pipes: [],
            interceptors: [],
            filters: [],
          },
        },
      ];

      vi.mocked(api.fetchRoutes).mockResolvedValue({
        routes: routesWithEmpty,
      });

      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.queryByText('EmptyController')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(api.fetchRoutes).mockRejectedValue(new Error('Network error'));

      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.queryByText(/loading routes/i)).not.toBeInTheDocument();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch routes:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Route Details Modal', () => {
    beforeEach(() => {
      vi.mocked(api.fetchRoutes).mockResolvedValue({
        routes: createMockRoutes(),
      });
    });

    it('should show details button for each route', async () => {
      render(<RoutesView />);

      await waitFor(() => {
        const detailsButtons = screen.getAllByRole('button', { name: /details/i });
        expect(detailsButtons.length).toBe(4); // 4 routes
      });
    });

    it('should open modal when details button is clicked', async () => {
      const user = userEvent.setup();

      render(<RoutesView />);

      await waitFor(() => {
        expect(screen.getByText('findAll')).toBeInTheDocument();
      });

      const detailsButtons = screen.getAllByRole('button', { name: /details/i });
      await user.click(detailsButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Route Execution Chain/i)).toBeInTheDocument();
      });
    });
  });
});

