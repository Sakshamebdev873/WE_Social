import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, router } from 'expo-router';
import { useCareProvider } from '@modules/care/hooks/useCareProviders';
import { useAddressReveal, useSetCareBookingStatus } from '@modules/care/hooks/useAddressReveal';
import { useCareStore } from '@modules/care/store/careStore';
import { useSession } from '@core/session/SessionProvider';
import { useOfflineBooking } from '@core/offline/useOfflineBooking';
import { useOfflineQueue } from '@core/offline/useOfflineQueue';
import { useNetworkStore } from '@core/offline/networkStatus';
import { OfflineDemoPanel } from '@core/ui/OfflineDemoPanel';

// Leaflet + OpenStreetMap in a WebView, not react-native-maps: the Google Maps
// SDK requires a billing-account-backed API key even in dev, and its Expo Go
// shared key is currently broken (renders tiles as a gray grid — see
// https://github.com/react-native-maps/react-native-maps/issues/5888). OSM
// tiles need no key/account and render fine inside Expo Go via WebView.
function buildLeafletMapHtml(lat: number, lng: number, showRevealCircle: boolean, radiusMeters: number): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>html, body, #map { height: 100%; margin: 0; padding: 0; }</style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${lat}, ${lng}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    L.marker([${lat}, ${lng}]).addTo(map);
    ${showRevealCircle ? `L.circle([${lat}, ${lng}], { radius: ${radiusMeters}, color: 'rgba(17,17,17,0.4)', fillColor: 'rgba(17,17,17,0.08)', fillOpacity: 1, weight: 1 }).addTo(map);` : ''}
  </script>
</body>
</html>`;
}

export default function CareProviderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: provider, isLoading } = useCareProvider(id);
  const { prefilledWindow } = useCareStore();
  const { jwt } = useSession();

  const [activeQueueLocalId, setActiveQueueLocalId] = useState<string | null>(null);
  const { simulateConflict } = useNetworkStore();

  const { reveal, latestBooking } = useAddressReveal(provider, jwt?.user.id);
  const mapHtml = useMemo(
    () => buildLeafletMapHtml(reveal.pin.lat, reveal.pin.lng, !reveal.isRevealed, 500),
    [reveal.pin.lat, reveal.pin.lng, reveal.isRevealed]
  );
  const setStatus = useSetCareBookingStatus();
  const offlineBooking = useOfflineBooking();
  const { data: queue } = useOfflineQueue();

  const myQueueItem = queue?.find((q) => q.localId === activeQueueLocalId);
  const isQueuedOrSyncing = myQueueItem?.status === 'QUEUED' || myQueueItem?.status === 'SYNCING';
  const isConflictRejected = myQueueItem?.status === 'CONFLICT_REJECTED';

  async function handleRequestBooking() {
    if (!jwt || !provider) return;
    const start = prefilledWindow?.startTime ?? new Date().toISOString();
    const end = prefilledWindow?.endTime ?? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    const result = await offlineBooking.mutateAsync({
      draft: {
        module: 'care',
        providerId: provider.id,
        userId: jwt.user.id,
        startTime: start,
        endTime: end,
        contextBookingId: prefilledWindow?.contextBookingId,
      },
      simulateConflict,
    });

    if (result.status === 'QUEUED' && result.queueItem) {
      setActiveQueueLocalId(result.queueItem.localId);
    }
  }

  if (isLoading) return <ActivityIndicator style={styles.loader} />;
  if (!provider) return <Text style={styles.notFound}>Provider not found</Text>;

  return (
    <View style={styles.container}>
      <WebView style={styles.map} source={{ html: mapHtml }} originWhitelist={['*']} />


      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent}>
        <Text style={styles.title}>{provider.displayName}</Text>
        <Text style={styles.meta}>{provider.service} · ${provider.hourlyRate}/hr</Text>

        <View style={[styles.addressBox, reveal.isRevealed && styles.addressBoxRevealed]}>
          <Text style={styles.addressLabel}>
            {reveal.isRevealed ? 'Exact address (booking confirmed)' : 'Approximate area (~500m)'}
          </Text>
          <Text style={styles.addressValue}>
            {reveal.isRevealed ? reveal.address : 'Exact address hidden until CONFIRMED'}
          </Text>
        </View>

        {!latestBooking && !isQueuedOrSyncing && !isConflictRejected && (
          <Pressable style={styles.primaryButton} onPress={handleRequestBooking}>
            <Text style={styles.primaryButtonText}>Request booking</Text>
          </Pressable>
        )}

        {isQueuedOrSyncing && (
          <View style={styles.pendingSyncBox}>
            <Text style={styles.pendingSyncText}>
              Booking Pending Sync ({myQueueItem?.status}) — you&apos;re offline, this will push to the
              server automatically once you reconnect.
            </Text>
          </View>
        )}

        {isConflictRejected && (
          <View style={styles.conflictBox}>
            <Text style={styles.conflictText}>
              Booking rejected: {myQueueItem?.errorMessage}. Your optimistic booking has been rolled back.
            </Text>
            <Pressable onPress={() => setActiveQueueLocalId(null)}>
              <Text style={styles.link}>Try a different time</Text>
            </Pressable>
          </View>
        )}

        {latestBooking && latestBooking.status !== 'CONFIRMED' && !isQueuedOrSyncing && (
          <View style={styles.demoRow}>
            <Text style={styles.demoLabel}>
              Booking status: {latestBooking.status} — simulate the provider/host response:
            </Text>
            <View style={styles.demoButtons}>
              <Pressable
                style={[styles.demoButton, styles.confirmButton]}
                onPress={() => setStatus.mutate({ bookingId: latestBooking.id, status: 'CONFIRMED' })}
              >
                <Text style={styles.demoButtonText}>Confirm</Text>
              </Pressable>
              <Pressable
                style={[styles.demoButton, styles.cancelButton]}
                onPress={() => setStatus.mutate({ bookingId: latestBooking.id, status: 'CANCELLED' })}
              >
                <Text style={styles.demoButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}

        {latestBooking?.status === 'CONFIRMED' && (
          <Text style={styles.confirmedNote}>Booking confirmed — exact address revealed above.</Text>
        )}

        <OfflineDemoPanel />

        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Back</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { marginTop: 100 },
  notFound: { marginTop: 100, textAlign: 'center', color: '#666' },
  map: { height: '40%', width: '100%' },
  sheet: { flex: 1 },
  sheetContent: { padding: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: '700' },
  meta: { color: '#444' },
  addressBox: { padding: 12, borderRadius: 10, backgroundColor: '#f2f2f2', gap: 2 },
  addressBoxRevealed: { backgroundColor: '#e7f7ec' },
  addressLabel: { fontSize: 11, color: '#777', textTransform: 'uppercase' },
  addressValue: { fontSize: 14, fontWeight: '600', color: '#222' },
  primaryButton: { padding: 14, borderRadius: 10, backgroundColor: '#111', alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  pendingSyncBox: { padding: 12, borderRadius: 10, backgroundColor: '#fff7e6' },
  pendingSyncText: { fontSize: 13, color: '#8a6d1a' },
  conflictBox: { padding: 12, borderRadius: 10, backgroundColor: '#fdecec', gap: 6 },
  conflictText: { fontSize: 13, color: '#a3242c' },
  demoRow: { marginTop: 8, gap: 8 },
  demoLabel: { fontSize: 12, color: '#666' },
  demoButtons: { flexDirection: 'row', gap: 8 },
  demoButton: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  confirmButton: { backgroundColor: '#1a7f37' },
  cancelButton: { backgroundColor: '#a3242c' },
  demoButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  confirmedNote: { marginTop: 8, color: '#1a7f37', fontSize: 13, fontWeight: '600' },
  link: { marginTop: 16, textAlign: 'center', color: '#555' },
});
