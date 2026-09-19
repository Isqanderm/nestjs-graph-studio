import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import GraphQLView from '../GraphQLView';
import * as api from '../api';
import { GraphQLOperationMeta } from '../types';

vi.mock('../api', () => ({
  fetchGraphQLOperations: vi.fn(),
}));

function createMockOperations(): GraphQLOperationMeta[] {
  return [
    {
      kind: 'QUERY',
      typeName: 'Query',
      fieldName: 'products',
      resolverClass: 'ProductResolver',
      methodName: 'products',
      chain: { guards: ['AuthGuard'], pipes: [], interceptors: [], filters: [] },
    },
    {
      kind: 'MUTATION',
      typeName: 'Mutation',
      fieldName: 'createOrder',
      resolverClass: 'OrderResolver',
      methodName: 'createOrder',
      chain: { guards: [], pipes: ['ValidationPipe'], interceptors: [], filters: [] },
    },
    {
      kind: 'FIELD',
      typeName: 'Product',
      fieldName: 'variants',
      resolverClass: 'ProductFieldResolver',
      methodName: 'variants',
      chain: { guards: [], pipes: [], interceptors: [], filters: [] },
    },
  ];
}

describe('GraphQLView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading state before data arrives', () => {
    vi.mocked(api.fetchGraphQLOperations).mockImplementation(() => new Promise(() => {}));

    render(<GraphQLView />);

    expect(screen.getByText(/loading graphql operations/i)).toBeInTheDocument();
  });

  it('renders the header and table headers once loaded', async () => {
    vi.mocked(api.fetchGraphQLOperations).mockResolvedValue({
      createdAt: new Date().toISOString(),
      stats: { resolverClasses: 3, queries: 1, mutations: 1, subscriptions: 0, fields: 1 },
      operations: createMockOperations(),
    });

    render(<GraphQLView />);

    await waitFor(() => {
      expect(screen.getByText('GraphQL')).toBeInTheDocument();
      expect(screen.getByText('Kind')).toBeInTheDocument();
      expect(screen.getByText('Field')).toBeInTheDocument();
      expect(screen.getByText('Resolver')).toBeInTheDocument();
    });
  });

  it('renders one row per operation', async () => {
    vi.mocked(api.fetchGraphQLOperations).mockResolvedValue({
      createdAt: new Date().toISOString(),
      stats: { resolverClasses: 3, queries: 1, mutations: 1, subscriptions: 0, fields: 1 },
      operations: createMockOperations(),
    });

    render(<GraphQLView />);

    await waitFor(() => {
      expect(screen.getByText('Query.products')).toBeInTheDocument();
      expect(screen.getByText('Mutation.createOrder')).toBeInTheDocument();
      expect(screen.getByText('Product.variants')).toBeInTheDocument();
    });
  });

  it('filters operations by resolver class name', async () => {
    vi.mocked(api.fetchGraphQLOperations).mockResolvedValue({
      createdAt: new Date().toISOString(),
      stats: { resolverClasses: 3, queries: 1, mutations: 1, subscriptions: 0, fields: 1 },
      operations: createMockOperations(),
    });

    render(<GraphQLView />);
    await waitFor(() => expect(screen.getByText('Query.products')).toBeInTheDocument());

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/filter operations/i), 'OrderResolver');

    expect(screen.queryByText('Query.products')).not.toBeInTheDocument();
    expect(screen.getByText('Mutation.createOrder')).toBeInTheDocument();
  });

  it('opens the execution chain dialog with guard details on Details click', async () => {
    vi.mocked(api.fetchGraphQLOperations).mockResolvedValue({
      createdAt: new Date().toISOString(),
      stats: { resolverClasses: 3, queries: 1, mutations: 1, subscriptions: 0, fields: 1 },
      operations: createMockOperations(),
    });

    render(<GraphQLView />);
    await waitFor(() => expect(screen.getByText('Query.products')).toBeInTheDocument());

    const user = userEvent.setup();
    const detailsButtons = screen.getAllByRole('button', { name: /details/i });
    await user.click(detailsButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('GraphQL Execution Chain')).toBeInTheDocument();
      expect(screen.getByText('AuthGuard')).toBeInTheDocument();
    });
  });
});
