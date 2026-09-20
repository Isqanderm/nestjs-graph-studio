import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExecutionChainDiagram from '../ExecutionChainDiagram';
import { RouteMeta } from '../../types';

function createRoute(overrides: Partial<RouteMeta> = {}): RouteMeta {
  return {
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
    ...overrides,
  };
}

describe('ExecutionChainDiagram', () => {
  it('renders each guard, pipe, interceptor, and filter name', () => {
    const route = createRoute({
      chain: {
        guards: ['AuthGuard', 'RolesGuard'],
        pipes: ['ValidationPipe'],
        interceptors: ['LoggingInterceptor'],
        filters: ['HttpExceptionFilter'],
      },
    });

    render(<ExecutionChainDiagram route={route} />);

    expect(screen.getByText('AuthGuard')).toBeInTheDocument();
    expect(screen.getByText('RolesGuard')).toBeInTheDocument();
    expect(screen.getByText('ValidationPipe')).toBeInTheDocument();
    expect(screen.getByText('LoggingInterceptor')).toBeInTheDocument();
    expect(screen.getByText('HttpExceptionFilter')).toBeInTheDocument();
  });

  it('renders a muted placeholder for empty categories instead of a labeled column', () => {
    const route = createRoute();

    render(<ExecutionChainDiagram route={route} />);

    expect(screen.getByText('• Guards')).toBeInTheDocument();
    expect(screen.getByText('• Interceptors')).toBeInTheDocument();
    expect(screen.getByText('• Pipes')).toBeInTheDocument();
    expect(screen.getByText('• Filters')).toBeInTheDocument();
  });

  it('renders the method and path as the active handler node, labeled by controller', () => {
    const route = createRoute({ method: 'GET', path: '/health', controller: 'HealthController' });

    render(<ExecutionChainDiagram route={route} />);

    expect(screen.getByText('HealthController')).toBeInTheDocument();
    expect(screen.getByText('GET /health')).toBeInTheDocument();
  });
});
