import { create } from 'zustand';
import type { SportKind } from '../types';

interface SportsState {
  sportFilter: SportKind | 'all';
  setSportFilter: (filter: SportKind | 'all') => void;
}

/**
 * Local UI-only state for the Sports module. Deliberately not shared with
 * Events/Care — each module owns its own store instance/module scope so
 * resetting or hot-reloading one never touches another's state.
 */
export const useSportsStore = create<SportsState>((set) => ({
  sportFilter: 'all',
  setSportFilter: (filter) => set({ sportFilter: filter }),
}));
