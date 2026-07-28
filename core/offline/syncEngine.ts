import { sportsRepository } from '@modules/sports/repository/sportsRepository';
import { careRepository } from '@modules/care/repository/careRepository';
import { listPendingQueue, updateQueueItem } from './queue';
import { ConflictError, type BookingDraft, type QueueItem } from './types';

/**
 * The only place that knows how to turn a queued draft into a real booking
 * per module. Lives in core/offline (kernel), not inside a module, because
 * draining the queue inherently needs to reach across modules — that's a
 * kernel responsibility, same justification as core/crossModule.
 */
export async function createRemoteBooking(draft: BookingDraft): Promise<{ remoteId: string }> {
  if (draft.module === 'sports') {
    const booking = await sportsRepository.createBooking({
      coachId: draft.coachId,
      userId: draft.userId,
      startTime: draft.startTime,
      endTime: draft.endTime,
    });
    return { remoteId: booking.id };
  }

  const booking = await careRepository.createBooking({
    providerId: draft.providerId,
    userId: draft.userId,
    startTime: draft.startTime,
    endTime: draft.endTime,
    contextBookingId: draft.contextBookingId,
  });
  return { remoteId: booking.id };
}

async function syncOne(item: QueueItem): Promise<void> {
  updateQueueItem(item.localId, { status: 'SYNCING' });

  try {
    if (item.simulateConflict) {
      // Stands in for Supabase returning 409 Conflict because the provider
      // was booked by someone else while this device was offline.
      throw new ConflictError();
    }

    const { remoteId } = await createRemoteBooking(item.draft);
    updateQueueItem(item.localId, { status: 'SUCCESS', remoteId, errorMessage: null });
  } catch (error) {
    if (error instanceof ConflictError) {
      updateQueueItem(item.localId, { status: 'CONFLICT_REJECTED', errorMessage: error.message });
    } else {
      // Unknown/transient failure: leave it QUEUED so the next reconnect retries it.
      updateQueueItem(item.localId, { status: 'QUEUED', errorMessage: (error as Error).message });
    }
  }
}

let isDraining = false;

/**
 * Drains QUEUED items FIFO. Safe to call multiple times concurrently
 * (reconnect events can fire more than once) — re-entrant calls are no-ops
 * while a drain is already in flight.
 */
export async function drainQueue(): Promise<void> {
  if (isDraining) return;
  isDraining = true;
  try {
    const pending = listPendingQueue();
    for (const item of pending) {
      await syncOne(item);
    }
  } finally {
    isDraining = false;
  }
}
