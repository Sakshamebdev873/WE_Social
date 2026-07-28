import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSession } from '@core/session/SessionProvider';
import { buildCareSuggestionHref } from '@core/crossModule/bookingBridge';
import { useOfflineBooking } from '@core/offline/useOfflineBooking';
import { useOfflineQueue } from '@core/offline/useOfflineQueue';
import { useNetworkStore } from '@core/offline/networkStatus';
import { OfflineDemoPanel } from '@core/ui/OfflineDemoPanel';

const SESSION_LENGTH_HOURS = 2;

export default function SportsBookingScreen() {
  const { id: coachId } = useLocalSearchParams<{ id: string }>();
  const { jwt } = useSession();
  const offlineBooking = useOfflineBooking();
  const { data: queue } = useOfflineQueue();
  const { simulateConflict } = useNetworkStore();
  const [activeQueueLocalId, setActiveQueueLocalId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ id: string; startTime: string; endTime: string } | null>(null);

  const myQueueItem = queue?.find((q) => q.localId === activeQueueLocalId);
  const isQueuedOrSyncing = myQueueItem?.status === 'QUEUED' || myQueueItem?.status === 'SYNCING';
  const isConflictRejected = myQueueItem?.status === 'CONFLICT_REJECTED';

  async function handleBook() {
    if (!jwt || !coachId) return;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + SESSION_LENGTH_HOURS * 60 * 60 * 1000);

    const result = await offlineBooking.mutateAsync({
      draft: {
        module: 'sports',
        coachId,
        userId: jwt.user.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      },
      simulateConflict,
    });

    if (result.status === 'QUEUED' && result.queueItem) {
      setActiveQueueLocalId(result.queueItem.localId);
      // Time window is known client-side even before sync settles, so the
      // Care deep-link can use it immediately; the id is provisional until synced.
      setConfirmed({ id: result.queueItem.localId, startTime: startTime.toISOString(), endTime: endTime.toISOString() });
    } else if (result.status === 'CREATED' && result.remoteId) {
      setConfirmed({ id: result.remoteId, startTime: startTime.toISOString(), endTime: endTime.toISOString() });
    }
  }

  if (isConflictRejected) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Booking rejected</Text>
        <Text style={styles.body}>{myQueueItem?.errorMessage}</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => {
            setActiveQueueLocalId(null);
            setConfirmed(null);
          }}
        >
          <Text style={styles.primaryButtonText}>Try another coach</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (confirmed) {
    const careHref = buildCareSuggestionHref({
      contextModule: 'sports',
      contextBookingId: confirmed.id,
      startTime: confirmed.startTime,
      endTime: confirmed.endTime,
    });

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{isQueuedOrSyncing ? 'Booking Pending Sync' : 'Session booked ✅'}</Text>
        <Text style={styles.body}>
          {new Date(confirmed.startTime).toLocaleTimeString()} –{' '}
          {new Date(confirmed.endTime).toLocaleTimeString()}
        </Text>
        {isQueuedOrSyncing && (
          <Text style={styles.pendingNote}>
            Status: {myQueueItem?.status} — you&apos;re offline, this will sync automatically on reconnect.
          </Text>
        )}

        <View style={styles.promptCard}>
          <Text style={styles.promptTitle}>Need childcare during this session?</Text>
          <Text style={styles.promptBody}>
            We&apos;ll show Care providers available for your exact {SESSION_LENGTH_HOURS}-hour window.
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => router.push(careHref)}>
            <Text style={styles.primaryButtonText}>Find childcare for this window</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.replace('/(sports)')}>
          <Text style={styles.link}>Back to Sports</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Book a {SESSION_LENGTH_HOURS}-hour session</Text>
      <Text style={styles.body}>Coach: {coachId}</Text>
      <Pressable style={styles.primaryButton} onPress={handleBook} disabled={offlineBooking.isPending}>
        <Text style={styles.primaryButtonText}>
          {offlineBooking.isPending ? 'Booking…' : 'Confirm booking'}
        </Text>
      </Pressable>

      <OfflineDemoPanel />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, paddingTop: 80, gap: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  body: { color: '#444' },
  pendingNote: { color: '#8a6d1a', fontSize: 13 },
  primaryButton: { marginTop: 16, padding: 14, borderRadius: 10, backgroundColor: '#111', alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  promptCard: { marginTop: 24, padding: 16, borderRadius: 12, backgroundColor: '#fff7e6', gap: 8 },
  promptTitle: { fontWeight: '700', fontSize: 15 },
  promptBody: { color: '#555', fontSize: 13 },
  link: { marginTop: 20, textAlign: 'center', color: '#555' },
});
