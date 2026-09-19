import { create } from 'zustand';
import { GraphSnapshot, IssueReport } from './types';

interface AppState {
  graph: GraphSnapshot | null;
  loading: boolean;
  error: string | null;
  issues: IssueReport | null;
  focusNodeIds: string[] | null;

  setGraph: (graph: GraphSnapshot) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIssues: (issues: IssueReport) => void;
  setFocusNodeIds: (nodeIds: string[] | null) => void;
}

export const useStore = create<AppState>((set) => ({
  graph: null,
  loading: false,
  error: null,
  issues: null,
  focusNodeIds: null,

  setGraph: (graph) => set({ graph }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setIssues: (issues) => set({ issues }),

  setFocusNodeIds: (nodeIds) => set({ focusNodeIds: nodeIds }),
}));
