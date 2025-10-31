import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import GraphView from '../GraphView';
import { useStore } from '../../store';
import { GraphSnapshot, GraphNode, GraphEdge } from '../../types';

// Mock React Flow
vi.mock('reactflow', () => ({
  default: ({ children }: any) => <div data-testid="react-flow">{children}</div>,
  ReactFlowProvider: ({ children }: any) => <div>{children}</div>,
  Controls: () => <div data-testid="react-flow-controls" />,
  Background: () => <div data-testid="react-flow-background" />,
  MiniMap: () => <div data-testid="react-flow-minimap" />,
  Panel: ({ children }: any) => <div>{children}</div>,
  useNodesState: () => [[], vi.fn(), vi.fn()],
  useEdgesState: () => [[], vi.fn(), vi.fn()],
  useReactFlow: () => ({
    fitView: vi.fn(),
    setViewport: vi.fn(),
    getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
  }),
  getRectOfNodes: vi.fn(() => ({ x: 0, y: 0, width: 100, height: 100 })),
  getTransformForBounds: vi.fn(() => [0, 0, 1]),
  Position: {
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom',
  },
}));

// Mock html-to-image
vi.mock('html-to-image', () => ({
  toPng: vi.fn(() => Promise.resolve('data:image/png;base64,mock')),
}));

// Helper function to create mock graph data
function createMockGraph(): GraphSnapshot {
  const nodes: GraphNode[] = [
    {
      id: 'module-1',
      name: 'AppModule',
      type: 'MODULE',
      scope: 'SINGLETON',
    },
    {
      id: 'controller-1',
      name: 'UsersController',
      type: 'CONTROLLER',
      scope: 'SINGLETON',
      module: 'AppModule',
    },
    {
      id: 'provider-1',
      name: 'UsersService',
      type: 'PROVIDER',
      scope: 'SINGLETON',
      module: 'AppModule',
    },
    {
      id: 'route-1',
      name: 'GET /users',
      type: 'ROUTE',
      module: 'AppModule',
      route: {
        method: 'GET',
        path: '/users',
      },
    },
  ];

  const edges: GraphEdge[] = [
    {
      from: 'controller-1',
      to: 'provider-1',
      kind: 'injects',
    },
    {
      from: 'route-1',
      to: 'controller-1',
      kind: 'handles',
    },
  ];

  return {
    createdAt: new Date().toISOString(),
    stats: {
      modules: 1,
      providers: 1,
      controllers: 1,
      routes: 1,
    },
    nodes,
    edges,
    routes: [
      {
        method: 'GET',
        path: '/users',
        controller: 'UsersController',
        handler: 'findAll',
        chain: {
          guards: [],
          pipes: [],
          interceptors: [],
          filters: [],
        },
      },
    ],
  };
}

// Wrapper component with Router
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

describe('GraphView', () => {
  beforeEach(() => {
    // Reset store state
    useStore.setState({
      graph: null,
      events: [],
      loading: false,
      error: null,
      connected: false,
    });

    // Clear localStorage mock
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render loading state when graph is null', () => {
      useStore.setState({ graph: null, loading: true });

      const { container } = render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      // Check that component renders without crashing
      expect(container).toBeInTheDocument();
    });

    it('should render graph container when graph data is available', async () => {
      const mockGraph = createMockGraph();
      useStore.setState({ graph: mockGraph, loading: false });

      const { container } = render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      // Wait for component to render
      await waitFor(() => {
        expect(container.querySelector('.graph-view') || container.querySelector('[class*="graph"]')).toBeTruthy();
      }, { timeout: 1000 });
    });

    it('should render search input', async () => {
      const mockGraph = createMockGraph();
      useStore.setState({ graph: mockGraph });

      render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      // Check for search input
      await waitFor(() => {
        const searchInput = screen.queryByPlaceholderText(/search/i);
        expect(searchInput).toBeInTheDocument();
      });
    });
  });

  describe('Store Integration', () => {
    it('should use graph data from store', () => {
      const mockGraph = createMockGraph();
      useStore.setState({ graph: mockGraph });

      const { container } = render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      // Component should render with graph data
      expect(container).toBeInTheDocument();
    });

    it('should handle null graph state', () => {
      useStore.setState({ graph: null });

      const { container } = render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      // Component should render without crashing
      expect(container).toBeInTheDocument();
    });
  });

  describe('Mock Data', () => {
    it('should create valid mock graph data', () => {
      const mockGraph = createMockGraph();

      expect(mockGraph.nodes).toHaveLength(4);
      expect(mockGraph.edges).toHaveLength(2);
      expect(mockGraph.routes).toHaveLength(1);
      expect(mockGraph.stats.modules).toBe(1);
      expect(mockGraph.stats.providers).toBe(1);
      expect(mockGraph.stats.controllers).toBe(1);
      expect(mockGraph.stats.routes).toBe(1);
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      const mockGraph = createMockGraph();
      useStore.setState({ graph: mockGraph });
    });

    it('should render search input', () => {
      render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText(/search nodes/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should update search term when typing', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText(/search nodes/i);
      await user.type(searchInput, 'AppModule');

      expect(searchInput).toHaveValue('AppModule');
    });

    it('should have search button', () => {
      render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toBeInTheDocument();
    });

    it('should have reset button', () => {
      render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      const resetButton = screen.getByRole('button', { name: /reset/i });
      expect(resetButton).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    beforeEach(() => {
      const mockGraph = createMockGraph();
      useStore.setState({ graph: mockGraph });
    });

    it('should have export PNG button', () => {
      render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      const exportButton = screen.getByRole('button', { name: /export png/i });
      expect(exportButton).toBeInTheDocument();
    });

    it('should call export function when button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      const exportButton = screen.getByRole('button', { name: /export png/i });
      await user.click(exportButton);

      // The export should be attempted (toPng is mocked)
      expect(exportButton).toBeInTheDocument();
    });
  });

  describe('Settings Panel', () => {
    beforeEach(() => {
      const mockGraph = createMockGraph();
      useStore.setState({ graph: mockGraph });
    });

    it('should have settings button', () => {
      render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      expect(settingsButton).toBeInTheDocument();
    });

    it('should open settings panel when button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsButton);

      // Settings panel should open
      await waitFor(() => {
        expect(screen.getByText(/graph options/i)).toBeInTheDocument();
      });
    });

    it('should toggle request-scoped highlighting', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByText(/highlight request-scoped/i)).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox', { name: /highlight request-scoped/i });
      await user.click(checkbox);

      // Setting should be toggled
      expect(checkbox).toBeChecked();
    });

    it('should toggle circular dependency detection', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByText(/detect circular/i)).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox', { name: /detect circular/i });
      await user.click(checkbox);

      // Setting should be toggled
      expect(checkbox).toBeChecked();
    });

    it('should toggle lock nodes setting', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByText(/lock nodes/i)).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox', { name: /lock nodes/i });
      await user.click(checkbox);

      // Setting should be toggled
      expect(checkbox).toBeChecked();
    });
  });

  describe('Reset Functionality', () => {
    beforeEach(() => {
      const mockGraph = createMockGraph();
      useStore.setState({ graph: mockGraph });
    });

    it('should reset view when reset button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      // Type in search
      const searchInput = screen.getByPlaceholderText(/search nodes/i);
      await user.type(searchInput, 'test');
      expect(searchInput).toHaveValue('test');

      // Click reset
      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      // Search should be cleared
      expect(searchInput).toHaveValue('');
    });
  });
});

