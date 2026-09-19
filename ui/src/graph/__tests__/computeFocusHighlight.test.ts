import { describe, it, expect } from 'vitest';
import { computeFocusHighlight } from '../GraphView';

describe('computeFocusHighlight', () => {
  it('does not apply when focusNodeIds is null', () => {
    const result = computeFocusHighlight(null, ['a', 'b']);
    expect(result.shouldApply).toBe(false);
    expect(result.matchingIds.size).toBe(0);
  });

  it('does not apply when focusNodeIds is an empty array', () => {
    const result = computeFocusHighlight([], ['a', 'b']);
    expect(result.shouldApply).toBe(false);
  });

  it('matches only the node ids present in both lists', () => {
    const result = computeFocusHighlight(['b', 'c'], ['a', 'b']);
    expect(result.shouldApply).toBe(true);
    expect(result.matchingIds).toEqual(new Set(['b']));
  });

  it('does not apply when none of the requested ids exist in the graph', () => {
    const result = computeFocusHighlight(['zzz'], ['a', 'b']);
    expect(result.shouldApply).toBe(false);
    expect(result.matchingIds.size).toBe(0);
  });

  it('matches multiple ids when a cycle or multi-node issue is focused', () => {
    const result = computeFocusHighlight(['a', 'c'], ['a', 'b', 'c']);
    expect(result.shouldApply).toBe(true);
    expect(result.matchingIds).toEqual(new Set(['a', 'c']));
  });
});
