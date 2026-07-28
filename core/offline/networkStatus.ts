import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';

interface NetworkState {
  isDeviceOnline: boolean;
  /** Demo override: lets the UI force an "offline" state without needing airplane mode. */
  isForcedOffline: boolean;
  /**
   * Demo override: shared across screens (not per-screen useState) so it
   * survives cross-module redirects like Sports -> Care, where the target
   * screen is a fresh mount and local state would otherwise reset to off.
   */
  simulateConflict: boolean;
  setDeviceOnline: (online: boolean) => void;
  setForcedOffline: (forced: boolean) => void;
  setSimulateConflict: (next: boolean) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isDeviceOnline: true,
  isForcedOffline: false,
  simulateConflict: false,
  setDeviceOnline: (online) => set({ isDeviceOnline: online }),
  setForcedOffline: (forced) => set({ isForcedOffline: forced }),
  setSimulateConflict: (next) => set({ simulateConflict: next }),
}));

export function isEffectivelyOnline(): boolean {
  const { isDeviceOnline, isForcedOffline } = useNetworkStore.getState();
  return isDeviceOnline && !isForcedOffline;
}

let unsubscribe: (() => void) | null = null;

export function startNetworkWatcher(): () => void {
  if (unsubscribe) return unsubscribe;

  unsubscribe = NetInfo.addEventListener((state) => {
    useNetworkStore.getState().setDeviceOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
  });

  return unsubscribe;
}
