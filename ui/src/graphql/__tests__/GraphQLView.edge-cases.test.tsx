import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import GraphQLView from '../GraphQLView';
import * as api from '../api';

vi.mock('../api', () => ({
  fetchGraphQLOperations: vi.fn(),
}));

describe('GraphQLView - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty States', () => {
    it('should display an empty table when there are no operations', async () => {
      vi.mocked(api.fetchGraphQLOperations).mockResolvedValue({
        createdAt: new Date().toISOString(),
        stats: { resolverClasses: 0, queries: 0, mutations: 0, subscriptions: 0, fields: 0 },
        operations: [],
      });

      render(<GraphQLView />);

      await waitFor(() => {
        expect(screen.queryByText(/loading graphql operations/i)).not.toBeInTheDocument();
      });

      const tbody = document.querySelector('tbody');
      expect(tbody?.children.length).toBe(0);
    });

    it('should show a loading state initially', () => {
      vi.mocked(api.fetchGraphQLOperations).mockImplementation(() => new Promise(() => {}));

      render(<GraphQLView />);

      expect(screen.getByText(/loading graphql operations/i)).toBeInTheDocument();
    });
  });

  describe('Fetch Failures', () => {
    it('should handle a rejected fetch without crashing, ending in an empty table', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(api.fetchGraphQLOperations).mockRejectedValue(new Error('Network error'));

      render(<GraphQLView />);

      await waitFor(() => {
        expect(screen.queryByText(/loading graphql operations/i)).not.toBeInTheDocument();
      });

      // Component renders its normal shell (header, filter, table) instead of crashing
      expect(screen.getByText('GraphQL')).toBeInTheDocument();
      const tbody = document.querySelector('tbody');
      expect(tbody?.children.length).toBe(0);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch GraphQL operations:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
