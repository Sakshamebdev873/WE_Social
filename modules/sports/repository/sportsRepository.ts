import type { SportsBooking, SportsCoach } from '../types';

/**
 * UI/hooks depend on this interface only. A production build swaps
 * MockSportsRepository for one backed by `supabase.from('sports_coaches')` /
 * `supabase.from('bookings')` without touching a single component.
 */
export interface SportsRepository {
  listCoaches(): Promise<SportsCoach[]>;
  listMyBookings(userId: string): Promise<SportsBooking[]>;
  createBooking(input: {
    coachId: string;
    userId: string;
    startTime: string;
    endTime: string;
  }): Promise<SportsBooking>;
}

const MOCK_COACHES: SportsCoach[] = [
  { id: 'coach-1', displayName: 'Alex Rivera', sport: 'tennis', hourlyRate: 45 },
  { id: 'coach-2', displayName: 'Priya Nair', sport: 'padel', hourlyRate: 38 },
  { id: 'coach-3', displayName: 'Marcus Chen', sport: 'basketball', hourlyRate: 30 },
];

const bookings: SportsBooking[] = [];

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

class MockSportsRepository implements SportsRepository {
  async listCoaches(): Promise<SportsCoach[]> {
    return delay([...MOCK_COACHES]);
  }

  async listMyBookings(userId: string): Promise<SportsBooking[]> {
    return delay(bookings.filter((b) => b.userId === userId));
  }

  async createBooking(input: {
    coachId: string;
    userId: string;
    startTime: string;
    endTime: string;
  }): Promise<SportsBooking> {
    const booking: SportsBooking = {
      id: `sb-${Date.now()}`,
      status: 'CONFIRMED',
      ...input,
    };
    bookings.push(booking);
    return delay(booking);
  }
}

export const sportsRepository: SportsRepository = new MockSportsRepository();
