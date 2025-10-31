import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import GraphView from '../GraphView';
import { useStore } from '../../store';
import { GraphSnapshot } from '../../types';

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

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

describe('GraphView - Edge Cases', () => {
  beforeEach(() => {
    useStore.setState({
      graph: null,
      events: [],
      loading: false,
      error: null,
      connected: false,
    });
    vi.clearAllMocks();
  });

  describe('Empty States', () => {
    it('should handle empty graph with no nodes', () => {
      const emptyGraph: GraphSnapshot = {
        createdAt: new Date().toISOString(),
        stats: { modules: 0, providers: 0, controllers: 0, routes: 0 },
        nodes: [],
        edges: [],
        routes: [],
      };

      useStore.setState({ graph: emptyGraph });
      const { container } = render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle graph with nodes but no edges', () => {
      const graphWithNoEdges: GraphSnapshot = {
        createdAt: new Date().toISOString(),
        stats: { modules: 1, providers: 0, controllers: 0, routes: 0 },
        nodes: [
          {
            id: 'module-1',
            name: 'AppModule',
            type: 'MODULE',
            scope: 'SINGLETON',
          },
        ],
        edges: [],
        routes: [],
      };

      useStore.setState({ graph: graphWithNoEdges });
      const { container } = render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should handle search with no results', async () => {
      const mockGraph: GraphSnapshot = {
        createdAt: new Date().toISOString(),
        stats: { modules: 1, providers: 0, controllers: 0, routes: 0 },
        nodes: [
          {
            id: 'module-1',
            name: 'AppModule',
            type: 'MODULE',
            scope: 'SINGLETON',
          },
        ],
        edges: [],
        routes: [],
      };

      useStore.setState({ graph: mockGraph });
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      const searchInput = await screen.findByPlaceholderText(/search/i);
      await user.type(searchInput, 'NonExistentNode');

      // Should not crash
      expect(searchInput).toHaveValue('NonExistentNode');
    });

    it('should handle empty search term', async () => {
      const mockGraph: GraphSnapshot = {
        createdAt: new Date().toISOString(),
        stats: { modules: 1, providers: 0, controllers: 0, routes: 0 },
        nodes: [
          {
            id: 'module-1',
            name: 'AppModule',
            type: 'MODULE',
            scope: 'SINGLETON',
          },
        ],
        edges: [],
        routes: [],
      };

      useStore.setState({ graph: mockGraph });
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      const searchInput = await screen.findByPlaceholderText(/search/i);
      await user.type(searchInput, '   ');

      // Should handle whitespace gracefully
      expect(searchInput).toHaveValue('   ');
    });
  });

  describe('Large Graphs', () => {
    it('should handle graph with many nodes', () => {
      const largeGraph: GraphSnapshot = {
        createdAt: new Date().toISOString(),
        stats: { modules: 10, providers: 100, controllers: 20, routes: 50 },
        nodes: Array.from({ length: 180 }, (_, i) => ({
          id: `node-${i}`,
          name: `Node${i}`,
          type: i < 10 ? 'MODULE' : i < 110 ? 'PROVIDER' : i < 130 ? 'CONTROLLER' : 'ROUTE',
          scope: 'SINGLETON',
        })),
        edges: Array.from({ length: 200 }, (_, i) => ({
          from: `node-${i % 180}`,
          to: `node-${(i + 1) % 180}`,
          kind: 'injects',
        })),
        routes: [],
      };

      useStore.setState({ graph: largeGraph });
      const { container } = render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Special Characters', () => {
    it('should handle nodes with special characters in names', () => {
      const graphWithSpecialChars: GraphSnapshot = {
        createdAt: new Date().toISOString(),
        stats: { modules: 1, providers: 1, controllers: 0, routes: 0 },
        nodes: [
          {
            id: 'module-1',
            name: 'App<Module>',
            type: 'MODULE',
            scope: 'SINGLETON',
          },
          {
            id: 'provider-1',
            name: 'User$Service',
            type: 'PROVIDER',
            scope: 'SINGLETON',
          },
        ],
        edges: [],
        routes: [],
      };

      useStore.setState({ graph: graphWithSpecialChars });
      const { container } = render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Missing Dependencies', () => {
    it('should handle nodes with missing dependencies', () => {
      const graphWithMissing: GraphSnapshot = {
        createdAt: new Date().toISOString(),
        stats: { modules: 1, providers: 1, controllers: 0, routes: 0 },
        nodes: [
          {
            id: 'provider-1',
            name: 'UserService',
            type: 'PROVIDER',
            scope: 'SINGLETON',
          },
          {
            id: 'missing-1',
            name: 'MissingDependency',
            type: 'MISSING',
            missing: {
              requiredBy: ['provider-1'],
              suggestedFix: 'Install the missing package',
            },
          },
        ],
        edges: [
          {
            from: 'provider-1',
            to: 'missing-1',
            kind: 'missing',
          },
        ],
        routes: [],
      };

      useStore.setState({ graph: graphWithMissing });
      const { container } = render(
        <TestWrapper>
          <GraphView />
        </TestWrapper>
      );

      expect(container).toBeInTheDocument();
    });
  });
});

