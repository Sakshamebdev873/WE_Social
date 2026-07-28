import type { CareBooking, CareProvider } from '../types';

export interface CareRepository {
  listProviders(): Promise<CareProvider[]>;
  getProvider(providerId: string): Promise<CareProvider | null>;
  listMyBookings(userId: string): Promise<CareBooking[]>;
  createBooking(input: {
    providerId: string;
    userId: string;
    startTime: string;
    endTime: string;
    contextBookingId?: string;
  }): Promise<CareBooking>;
  /**
   * Demo-only transition standing in for what would normally be a host
   * confirming/declining, or the sync engine settling an offline booking
   * (see Part 3). Drives the PENDING -> CONFIRMED/CANCELLED edge that the
   * address-reveal state machine reacts to.
   */
  setBookingStatus(bookingId: string, status: CareBooking['status']): Promise<CareBooking>;
}

const MOCK_PROVIDERS: CareProvider[] = [
  {
    id: 'care-1',
    displayName: 'Jamie Ortiz',
    service: 'babysitting',
    hourlyRate: 22,
    exactLat: 40.73061,
    exactLng: -73.935242,
    addressLine: '128 Bedford Ave, Brooklyn, NY',
  },
  {
    id: 'care-2',
    displayName: 'Grace Kim',
    service: 'eldercare',
    hourlyRate: 26,
    exactLat: 40.741895,
    exactLng: -73.989308,
    addressLine: '445 W 23rd St, New York, NY',
  },
  {
    id: 'care-3',
    displayName: 'Deshawn Miller',
    service: 'babysitting',
    hourlyRate: 20,
    exactLat: 40.678178,
    exactLng: -73.944158,
    addressLine: '900 Nostrand Ave, Brooklyn, NY',
  },
];

const bookings: CareBooking[] = [];

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

class MockCareRepository implements CareRepository {
  async listProviders(): Promise<CareProvider[]> {
    return delay([...MOCK_PROVIDERS]);
  }

  async getProvider(providerId: string): Promise<CareProvider | null> {
    return delay(MOCK_PROVIDERS.find((p) => p.id === providerId) ?? null);
  }

  async listMyBookings(userId: string): Promise<CareBooking[]> {
    return delay(bookings.filter((b) => b.userId === userId));
  }

  async createBooking(input: {
    providerId: string;
    userId: string;
    startTime: string;
    endTime: string;
    contextBookingId?: string;
  }): Promise<CareBooking> {
    const booking: CareBooking = {
      id: `cb-${Date.now()}`,
      status: 'PENDING',
      ...input,
    };
    bookings.push(booking);
    return delay(booking);
  }

  async setBookingStatus(bookingId: string, status: CareBooking['status']): Promise<CareBooking> {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) throw new Error(`Booking ${bookingId} not found`);
    booking.status = status;
    return delay(booking);
  }
}

export const careRepository: CareRepository = new MockCareRepository();
