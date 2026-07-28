export type SportKind = 'tennis' | 'padel' | 'basketball';

export interface SportsCoach {
  id: string;
  displayName: string;
  sport: SportKind;
  hourlyRate: number;
}

export type SportsBookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface SportsBooking {
  id: string;
  coachId: string;
  userId: string;
  /** ISO 8601 */
  startTime: string;
  /** ISO 8601 */
  endTime: string;
  status: SportsBookingStatus;
}
