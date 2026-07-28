import { create } from 'zustand';

interface EventsState {
  savedEventIds: Set<string>;
  toggleSaved: (eventId: string) => void;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  savedEventIds: new Set(),
  toggleSaved: (eventId) => {
    const next = new Set(get().savedEventIds);
    if (next.has(eventId)) next.delete(eventId);
    else next.add(eventId);
    set({ savedEventIds: next });
  },
}));
