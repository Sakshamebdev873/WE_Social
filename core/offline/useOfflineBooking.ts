import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isEffectivelyOnline } from './networkStatus';
import { enqueueBooking } from './queue';
import { createRemoteBooking } from './syncEngine';
import type { BookingDraft, QueueItem } from './types';

export interface OfflineBookingResult {
  /** CREATED = booked immediately against the backend. QUEUED = accepted locally, awaiting sync. */
  status: 'CREATED' | 'QUEUED';
  remoteId?: string;
  queueItem?: QueueItem;
}

interface OfflineBookingInput {
  draft: BookingDraft;
  /** Demo-only overrides, surfaced as toggles in the booking UI. */
  simulateOffline?: boolean;
  simulateConflict?: boolean;
}

/**
 * The single entry point Sports and Care booking screens both call. Neither
 * screen branches on connectivity itself — this hook decides whether the
 * booking goes straight through or into the offline queue, so the two
 * modules can't drift into different offline behaviors.
 */
export function useOfflineBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: OfflineBookingInput): Promise<OfflineBookingResult> => {
      const online = isEffectivelyOnline() && !input.simulateOffline;

      if (!online) {
        const queueItem = enqueueBooking(input.draft, { simulateConflict: input.simulateConflict });
        return { status: 'QUEUED', queueItem };
      }

      const { remoteId } = await createRemoteBooking(input.draft);
      return { status: 'CREATED', remoteId };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['offline', 'queue'] });
      void queryClient.invalidateQueries({ queryKey: ['sports', 'bookings'] });
      void queryClient.invalidateQueries({ queryKey: ['care', 'bookings'] });
    },
  });
}
