import { create } from 'zustand';
import type { CareService } from '../types';

interface CareState {
  serviceFilter: CareService | 'all';
  /** Set when arriving via the Sports/Events -> Care deep link. */
  prefilledWindow: { startTime: string; endTime: string; contextBookingId: string } | null;
  setServiceFilter: (filter: CareService | 'all') => void;
  setPrefilledWindow: (window: CareState['prefilledWindow']) => void;
}

export const useCareStore = create<CareState>((set) => ({
  serviceFilter: 'all',
  prefilledWindow: null,
  setServiceFilter: (filter) => set({ serviceFilter: filter }),
  setPrefilledWindow: (window) => set({ prefilledWindow: window }),
}));
