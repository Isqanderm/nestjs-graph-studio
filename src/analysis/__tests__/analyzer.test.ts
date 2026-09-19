import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GraphAnalyzer } from '../analyzer';
import { buildSnapshot } from './fixtures';
import { findCircularDependencies } from '../checks/circular-dependencies';
import { findUnusedProviders } from '../checks/unused-providers';
import { findScopeConflicts } from '../checks/scope-conflicts';
import { findDuplicateTokens } from '../checks/duplicate-tokens';

vi.mock('../checks/circular-dependencies', () => ({ findCircularDependencies: vi.fn() }));
vi.mock('../checks/unused-providers', () => ({ findUnusedProviders: vi.fn() }));
vi.mock('../checks/scope-conflicts', () => ({ findScopeConflicts: vi.fn() }));
vi.mock('../checks/duplicate-tokens', () => ({ findDuplicateTokens: vi.fn() }));

describe('GraphAnalyzer', () => {
  beforeEach(() => {
    vi.mocked(findCircularDependencies).mockReturnValue([
      {
        id: 'c1',
        category: 'circular-dependency',
        severity: 'warning',
        title: 't',
        description: 'd',
        nodeIds: [],
      },
    ]);
    vi.mocked(findUnusedProviders).mockReturnValue([
      {
        id: 'u1',
        category: 'unused-provider',
        severity: 'warning',
        title: 't',
        description: 'd',
        nodeIds: [],
      },
    ]);
    vi.mocked(findScopeConflicts).mockReturnValue([]);
    vi.mocked(findDuplicateTokens).mockReturnValue([
      {
        id: 'd1',
        category: 'duplicate-token',
        severity: 'info',
        title: 't',
        description: 'd',
        nodeIds: [],
      },
    ]);
  });

  it('combines issues from all checks and computes the severity summary', () => {
    const analyzer = new GraphAnalyzer();
    const report = analyzer.analyze(buildSnapshot([], []));

    expect(report.issues).toHaveLength(3);
    expect(report.summary).toEqual({ error: 0, warning: 2, info: 1 });
  });

  it('returns createdAt as an ISO timestamp', () => {
    const analyzer = new GraphAnalyzer();
    const report = analyzer.analyze(buildSnapshot([], []));

    expect(report.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('returns a zeroed summary when no checks find anything', () => {
    vi.mocked(findCircularDependencies).mockReturnValue([]);
    vi.mocked(findUnusedProviders).mockReturnValue([]);
    vi.mocked(findScopeConflicts).mockReturnValue([]);
    vi.mocked(findDuplicateTokens).mockReturnValue([]);

    const analyzer = new GraphAnalyzer();
    const report = analyzer.analyze(buildSnapshot([], []));

    expect(report.issues).toEqual([]);
    expect(report.summary).toEqual({ error: 0, warning: 0, info: 0 });
  });
});
