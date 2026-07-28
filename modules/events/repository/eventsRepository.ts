import type { CommunityEvent } from '../types';

export interface EventsRepository {
  listEvents(): Promise<CommunityEvent[]>;
}

const MOCK_EVENTS: CommunityEvent[] = [
  { id: 'ev-1', title: 'Neighborhood Potluck', startTime: '2026-08-02T18:00:00.000Z', location: 'Riverside Park', attendeeCount: 24 },
  { id: 'ev-2', title: 'Weekend Flea Market', startTime: '2026-08-09T10:00:00.000Z', location: 'Main Street Square', attendeeCount: 61 },
];

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

class MockEventsRepository implements EventsRepository {
  async listEvents(): Promise<CommunityEvent[]> {
    return delay([...MOCK_EVENTS]);
  }
}

export const eventsRepository: EventsRepository = new MockEventsRepository();
