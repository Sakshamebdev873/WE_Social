import { useQuery } from '@tanstack/react-query';
import { listQueue } from './queue';

export function useOfflineQueue() {
  return useQuery({
    queryKey: ['offline', 'queue'],
    queryFn: () => Promise.resolve(listQueue()),
    // Queue only changes via mutation/sync events we already invalidate on;
    // a short poll just covers the SYNCING window between those events.
    refetchInterval: 2000,
  });
}
