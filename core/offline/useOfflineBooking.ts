import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@core/session/SessionProvider';
import { roleCanAccess } from '@core/rbac/types';
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
 *
 * Role is enforced here too (Guest is browse-only, per the login screen's own
 * copy) so the rule holds even if a screen forgets its own RBAC gate.
 */
export function useOfflineBooking() {
  const queryClient = useQueryClient();
  const { jwt } = useSession();

  return useMutation({
    mutationFn: async (input: OfflineBookingInput): Promise<OfflineBookingResult> => {
      if (!jwt || !roleCanAccess(jwt.user.role, 'member')) {
        throw new Error('Guests can browse but not book — sign in as a Member or Host to book.');
      }

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
