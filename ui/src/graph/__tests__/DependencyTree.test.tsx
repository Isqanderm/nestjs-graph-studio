import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import DependencyTree from '../DependencyTree';
import { DependencyTree as DependencyTreeData } from '../buildDependencyTree';

function buildTree(): DependencyTreeData {
  return {
    root: { id: 'auth', name: 'AuthResolver', type: 'PROVIDER' },
    dependsOn: [
      {
        id: 'auth-service',
        name: 'AuthService',
        type: 'PROVIDER',
        isCycle: false,
        children: [
          { id: 'config', name: 'ConfigService', type: 'PROVIDER', isCycle: false, children: [] },
        ],
      },
    ],
    usedBy: [
      { id: 'admin', name: 'AdminApiModule', type: 'MODULE', isCycle: false, children: [] },
    ],
  };
}

describe('DependencyTree', () => {
  it('renders the root name and both section counts', () => {
    render(<DependencyTree tree={buildTree()} onSelectNode={vi.fn()} />);

    expect(screen.getByText('AuthResolver')).toBeInTheDocument();
    expect(screen.getByText('▾ Depends on (1)')).toBeInTheDocument();
    expect(screen.getByText('▾ Used by (1)')).toBeInTheDocument();
  });

  it('shows first-level children by default', () => {
    render(<DependencyTree tree={buildTree()} onSelectNode={vi.fn()} />);

    expect(screen.getByText('AuthService')).toBeInTheDocument();
    expect(screen.getByText('AdminApiModule')).toBeInTheDocument();
  });

  it('calls onSelectNode with the clicked node id', async () => {
    const user = userEvent.setup();
    const onSelectNode = vi.fn();
    render(<DependencyTree tree={buildTree()} onSelectNode={onSelectNode} />);

    await user.click(screen.getByText('AuthService'));
    expect(onSelectNode).toHaveBeenCalledWith('auth-service');
  });

  it('collapses a section when its toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<DependencyTree tree={buildTree()} onSelectNode={vi.fn()} />);

    await user.click(screen.getByText('▾ Depends on (1)'));
    expect(screen.getByText('▸ Depends on (1)')).toBeInTheDocument();
    expect(screen.queryByText('AuthService')).not.toBeInTheDocument();
  });

  it('renders a cyclic node as non-clickable text, not a button', () => {
    const tree: DependencyTreeData = {
      root: { id: 'a', name: 'A', type: 'PROVIDER' },
      dependsOn: [
        { id: 'a', name: 'A', type: 'PROVIDER', isCycle: true, children: [] },
      ],
      usedBy: [],
    };
    render(<DependencyTree tree={tree} onSelectNode={vi.fn()} />);

    expect(screen.getByText(/circular reference/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'A' })).not.toBeInTheDocument();
  });

  it('renders "Nothing" for an empty section', () => {
    const tree: DependencyTreeData = {
      root: { id: 'a', name: 'A', type: 'PROVIDER' },
      dependsOn: [],
      usedBy: [],
    };
    render(<DependencyTree tree={tree} onSelectNode={vi.fn()} />);

    const nothings = screen.getAllByText('Nothing');
    expect(nothings).toHaveLength(2);
  });
});
