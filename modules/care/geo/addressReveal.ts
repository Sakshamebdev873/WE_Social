import type { CareBooking, CareProvider } from '../types';
import { obfuscateLocation, type GeoPoint } from './obfuscate';

export interface AddressRevealState {
  pin: GeoPoint;
  isRevealed: boolean;
  address: string | null;
}

/**
 * Pure state-transition function for the address reveal state machine:
 *
 *   PENDING | CANCELLED | CONFLICT_REJECTED | QUEUED | SYNCING -> obfuscated pin, address hidden
 *   CONFIRMED                                                  -> exact pin, address shown
 *
 * Kept as a pure function (no hooks, no I/O) so the transition logic can be
 * reasoned about/tested independently of React Query or map rendering.
 */
export function resolveAddressReveal(
  provider: CareProvider,
  latestBooking: CareBooking | null | undefined
): AddressRevealState {
  const obfuscatedPin = obfuscateLocation(provider.id, { lat: provider.exactLat, lng: provider.exactLng });
  const isRevealed = latestBooking?.status === 'CONFIRMED';

  return {
    pin: isRevealed ? { lat: provider.exactLat, lng: provider.exactLng } : obfuscatedPin,
    isRevealed,
    address: isRevealed ? provider.addressLine : null,
  };
}
