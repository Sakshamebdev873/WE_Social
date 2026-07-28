export type QueueItemStatus = 'QUEUED' | 'SYNCING' | 'SUCCESS' | 'CONFLICT_REJECTED';

/**
 * Only Sports and Care currently produce bookings that need offline queueing
 * (per the brief: "Care Services or Sports Partners often have poor
 * internet"). Adding a module here means adding one branch in
 * core/offline/syncEngine.ts's dispatcher — nothing else in the queue/db
 * layer changes.
 */
export type BookingDraft =
  | {
      module: 'sports';
      coachId: string;
      userId: string;
      startTime: string;
      endTime: string;
    }
  | {
      module: 'care';
      providerId: string;
      userId: string;
      startTime: string;
      endTime: string;
      contextBookingId?: string;
    };

export interface QueueItem {
  localId: string;
  draft: BookingDraft;
  status: QueueItemStatus;
  createdAt: string;
  remoteId: string | null;
  errorMessage: string | null;
  /** Demo-only: forces the sync attempt for this item to reject with a 409. */
  simulateConflict: boolean;
}

/** Stand-in for the shape of a Postgres/PostgREST 409 from Supabase. */
export class ConflictError extends Error {
  constructor(message = 'Provider was booked by someone else while you were offline') {
    super(message);
    this.name = 'ConflictError';
  }
}
