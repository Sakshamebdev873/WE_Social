import React from 'react';
import { View, Text, Pressable, Switch, StyleSheet } from 'react-native';
import { useNetworkStore } from '@core/offline/networkStatus';
import { useOfflineQueue } from '@core/offline/useOfflineQueue';
import { useSyncEngine } from '@core/offline/SyncEngineProvider';
import type { QueueItemStatus } from '@core/offline/types';

const STATUS_COLOR: Record<QueueItemStatus, string> = {
  QUEUED: '#b8860b',
  SYNCING: '#1a4d8f',
  SUCCESS: '#1a7f37',
  CONFLICT_REJECTED: '#a3242c',
};

/**
 * Shared by Sports and Care booking screens. Demo controls stand in for
 * "device loses signal" / "server returns 409" without needing airplane
 * mode or a real backend race — the underlying queue/sync/conflict code
 * paths are the real ones, only the trigger is manual.
 */
export function OfflineDemoPanel({
  simulateConflict,
  onToggleSimulateConflict,
}: {
  simulateConflict: boolean;
  onToggleSimulateConflict: (next: boolean) => void;
}) {
  const { isForcedOffline, setForcedOffline } = useNetworkStore();
  const { data: queue } = useOfflineQueue();
  const { triggerSync } = useSyncEngine();

  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>Offline demo controls</Text>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Simulate offline device</Text>
        <Switch value={isForcedOffline} onValueChange={setForcedOffline} />
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Force 409 conflict on next sync</Text>
        <Switch value={simulateConflict} onValueChange={onToggleSimulateConflict} />
      </View>

      <Pressable style={styles.syncButton} onPress={() => void triggerSync()}>
        <Text style={styles.syncButtonText}>Sync queue now</Text>
      </Pressable>

      {(queue ?? []).length > 0 && (
        <View style={styles.queueList}>
          {(queue ?? []).map((item) => (
            <View key={item.localId} style={styles.queueRow}>
              <View style={[styles.dot, { backgroundColor: STATUS_COLOR[item.status] }]} />
              <Text style={styles.queueText} numberOfLines={1}>
                {item.draft.module} · {item.status}
                {item.errorMessage ? ` — ${item.errorMessage}` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { marginTop: 16, padding: 14, borderRadius: 12, backgroundColor: '#f7f7f7', gap: 10 },
  heading: { fontSize: 12, fontWeight: '700', color: '#555', textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 13, color: '#333' },
  syncButton: { padding: 10, borderRadius: 8, backgroundColor: '#111', alignItems: 'center' },
  syncButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  queueList: { gap: 6, marginTop: 4 },
  queueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  queueText: { fontSize: 12, color: '#444', flex: 1 },
});
