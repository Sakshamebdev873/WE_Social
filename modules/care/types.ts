export type CareService = 'babysitting' | 'eldercare';

export interface CareProvider {
  id: string;
  displayName: string;
  service: CareService;
  hourlyRate: number;
  /** Never sent to the map view directly — see modules/care/geo/obfuscate.ts */
  exactLat: number;
  exactLng: number;
  addressLine: string;
}

export type CareBookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'QUEUED'
  | 'SYNCING'
  | 'CONFLICT_REJECTED';

export interface CareBooking {
  id: string;
  providerId: string;
  userId: string;
  /** ISO 8601 */
  startTime: string;
  /** ISO 8601 */
  endTime: string;
  status: CareBookingStatus;
  contextBookingId?: string;
}
