import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { careRepository } from '../repository/careRepository';
import { resolveAddressReveal } from '../geo/addressReveal';
import type { CareProvider, CareBooking } from '../types';

function pickLatestBooking(bookings: CareBooking[], providerId: string): CareBooking | null {
  const forProvider = bookings.filter((b) => b.providerId === providerId);
  if (forProvider.length === 0) return null;
  // mock repository appends chronologically; last match is the most recent
  return forProvider[forProvider.length - 1] ?? null;
}

export function useAddressReveal(provider: CareProvider | null | undefined, userId: string | undefined) {
  const bookingsQuery = useQuery({
    queryKey: ['care', 'bookings', userId],
    queryFn: () => careRepository.listMyBookings(userId as string),
    enabled: Boolean(userId),
  });

  const latestBooking = provider && bookingsQuery.data ? pickLatestBooking(bookingsQuery.data, provider.id) : null;

  const reveal = provider
    ? resolveAddressReveal(provider, latestBooking)
    : { pin: { lat: 0, lng: 0 }, isRevealed: false, address: null };

  return { reveal, latestBooking, isLoading: bookingsQuery.isLoading };
}

export function useSetCareBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { bookingId: string; status: CareBooking['status'] }) =>
      careRepository.setBookingStatus(input.bookingId, input.status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['care', 'bookings'] });
    },
  });
}
