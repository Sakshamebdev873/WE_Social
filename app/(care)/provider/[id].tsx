import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useLocalSearchParams, router } from 'expo-router';
import { useCareProvider } from '@modules/care/hooks/useCareProviders';
import { useAddressReveal, useSetCareBookingStatus } from '@modules/care/hooks/useAddressReveal';
import { useCareStore } from '@modules/care/store/careStore';
import { useSession } from '@core/session/SessionProvider';
import { careRepository } from '@modules/care/repository/careRepository';
import type { CareBooking } from '@modules/care/types';

export default function CareProviderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: provider, isLoading } = useCareProvider(id);
  const { prefilledWindow } = useCareStore();
  const { jwt } = useSession();
  const [pendingBooking, setPendingBooking] = useState<CareBooking | null>(null);

  const { reveal, latestBooking } = useAddressReveal(provider, jwt?.user.id);
  const setStatus = useSetCareBookingStatus();
  const activeBooking = pendingBooking ?? latestBooking;

  async function handleRequestBooking() {
    if (!jwt || !provider) return;
    const start = prefilledWindow?.startTime ?? new Date().toISOString();
    const end = prefilledWindow?.endTime ?? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const booking = await careRepository.createBooking({
      providerId: provider.id,
      userId: jwt.user.id,
      startTime: start,
      endTime: end,
      contextBookingId: prefilledWindow?.contextBookingId,
    });
    setPendingBooking(booking);
  }

  if (isLoading) return <ActivityIndicator style={styles.loader} />;
  if (!provider) return <Text style={styles.notFound}>Provider not found</Text>;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: reveal.pin.lat,
          longitude: reveal.pin.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        region={{
          latitude: reveal.pin.lat,
          longitude: reveal.pin.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Marker coordinate={{ latitude: reveal.pin.lat, longitude: reveal.pin.lng }} />
        {!reveal.isRevealed && (
          <Circle
            center={{ latitude: reveal.pin.lat, longitude: reveal.pin.lng }}
            radius={500}
            strokeColor="rgba(17,17,17,0.4)"
            fillColor="rgba(17,17,17,0.08)"
          />
        )}
      </MapView>

      <View style={styles.sheet}>
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

        {!activeBooking && (
          <Pressable style={styles.primaryButton} onPress={handleRequestBooking}>
            <Text style={styles.primaryButtonText}>Request booking</Text>
          </Pressable>
        )}

        {activeBooking && activeBooking.status !== 'CONFIRMED' && (
          <View style={styles.demoRow}>
            <Text style={styles.demoLabel}>
              Booking status: {activeBooking.status} — simulate the provider/host response:
            </Text>
            <View style={styles.demoButtons}>
              <Pressable
                style={[styles.demoButton, styles.confirmButton]}
                onPress={() => setStatus.mutate({ bookingId: activeBooking.id, status: 'CONFIRMED' })}
              >
                <Text style={styles.demoButtonText}>Confirm</Text>
              </Pressable>
              <Pressable
                style={[styles.demoButton, styles.cancelButton]}
                onPress={() => setStatus.mutate({ bookingId: activeBooking.id, status: 'CANCELLED' })}
              >
                <Text style={styles.demoButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}

        {activeBooking && activeBooking.status === 'CONFIRMED' && (
          <Text style={styles.confirmedNote}>Booking confirmed — exact address revealed above.</Text>
        )}

        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { marginTop: 100 },
  notFound: { marginTop: 100, textAlign: 'center', color: '#666' },
  map: { height: '45%', width: '100%' },
  sheet: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: '700' },
  meta: { color: '#444' },
  addressBox: { padding: 12, borderRadius: 10, backgroundColor: '#f2f2f2', gap: 2 },
  addressBoxRevealed: { backgroundColor: '#e7f7ec' },
  addressLabel: { fontSize: 11, color: '#777', textTransform: 'uppercase' },
  addressValue: { fontSize: 14, fontWeight: '600', color: '#222' },
  primaryButton: { padding: 14, borderRadius: 10, backgroundColor: '#111', alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
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
