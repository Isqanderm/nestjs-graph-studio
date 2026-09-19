import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import IssuesView from '../IssuesView';
import * as api from '../../api';
import { useStore } from '../../store';
import { IssueReport } from '../../types';

vi.mock('../../api', () => ({
  fetchIssues: vi.fn(),
}));

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <IssuesView />
    </MemoryRouter>
  );
}

function createMockReport(): IssueReport {
  return {
    createdAt: '2024-01-01T00:00:00.000Z',
    issues: [
      {
        id: 'unused-provider:provider:AppModule:OrphanService',
        category: 'unused-provider',
        severity: 'warning',
        title: 'Unused provider: OrphanService',
        description: 'OrphanService is never injected anywhere.',
        nodeIds: ['provider:AppModule:OrphanService'],
        suggestedFix: 'Remove this provider if unused.',
      },
    ],
    summary: { error: 0, warning: 1, info: 0 },
  };
}

describe('IssuesView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStore.setState({ issues: null, focusNodeIds: null });
  });

  it('should display loading state initially', () => {
    vi.mocked(api.fetchIssues).mockImplementation(() => new Promise(() => {}));

    renderWithRouter();

    expect(screen.getByText(/loading issues/i)).toBeInTheDocument();
  });

  it('should render the issue summary and list after loading', async () => {
    vi.mocked(api.fetchIssues).mockResolvedValue(createMockReport());

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('issues-summary')).toBeInTheDocument();
    });

    expect(screen.getByText('Unused provider: OrphanService')).toBeInTheDocument();
    expect(screen.getAllByTestId('issue-item')).toHaveLength(1);
  });

  it('should render an empty state when there are no issues', async () => {
    vi.mocked(api.fetchIssues).mockResolvedValue({
      createdAt: '2024-01-01T00:00:00.000Z',
      issues: [],
      summary: { error: 0, warning: 0, info: 0 },
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('issues-empty-state')).toBeInTheDocument();
    });
  });

  it('should set focusNodeIds when "Show in graph" is clicked', async () => {
    vi.mocked(api.fetchIssues).mockResolvedValue(createMockReport());
    const user = userEvent.setup();

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Show in graph')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Show in graph'));

    expect(useStore.getState().focusNodeIds).toEqual(['provider:AppModule:OrphanService']);
  });

  it('should show an error message when the fetch fails', async () => {
    vi.mocked(api.fetchIssues).mockRejectedValue(new Error('Network error'));

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/failed to load issues/i)).toBeInTheDocument();
    });
  });
});
