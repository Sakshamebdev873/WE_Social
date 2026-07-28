import React, { createContext, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { startNetworkWatcher, useNetworkStore } from './networkStatus';
import { drainQueue } from './syncEngine';

interface SyncEngineContextValue {
  triggerSync: () => Promise<void>;
}

const SyncEngineContext = createContext<SyncEngineContextValue | null>(null);

export function SyncEngineProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  async function triggerSync() {
    await drainQueue();
    void queryClient.invalidateQueries({ queryKey: ['offline', 'queue'] });
    void queryClient.invalidateQueries({ queryKey: ['sports', 'bookings'] });
    void queryClient.invalidateQueries({ queryKey: ['care', 'bookings'] });
  }

  useEffect(() => {
    const unsubscribeWatcher = startNetworkWatcher();

    // Drain any bookings left QUEUED from a previous killed/offline session.
    void triggerSync();

    const unsubscribeStore = useNetworkStore.subscribe((state, prevState) => {
      const wasOnline = prevState.isDeviceOnline && !prevState.isForcedOffline;
      const nowOnline = state.isDeviceOnline && !state.isForcedOffline;
      if (!wasOnline && nowOnline) void triggerSync();
    });

    return () => {
      unsubscribeWatcher();
      unsubscribeStore();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <SyncEngineContext.Provider value={{ triggerSync }}>{children}</SyncEngineContext.Provider>;
}

export function useSyncEngine(): SyncEngineContextValue {
  const ctx = useContext(SyncEngineContext);
  if (!ctx) throw new Error('useSyncEngine must be used within SyncEngineProvider');
  return ctx;
}
