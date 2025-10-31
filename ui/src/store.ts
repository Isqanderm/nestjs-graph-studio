import { create } from 'zustand';
import { GraphSnapshot } from './types';

interface AppState {
  graph: GraphSnapshot | null;
  loading: boolean;
  error: string | null;

  setGraph: (graph: GraphSnapshot) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  graph: null,
  loading: false,
  error: null,

  setGraph: (graph) => set({ graph }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),
}));

