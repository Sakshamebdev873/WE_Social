import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useCareProvider } from '@modules/care/hooks/useCareProviders';
import { useCareStore } from '@modules/care/store/careStore';
import { useSession } from '@core/session/SessionProvider';
import { careRepository } from '@modules/care/repository/careRepository';

// Map view + deterministic geo-obfuscation lands here in Phase 2. For now
// this proves the navigation/booking-request path end to end.
export default function CareProviderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: provider, isLoading } = useCareProvider(id);
  const { prefilledWindow } = useCareStore();
  const { jwt } = useSession();

  async function handleRequestBooking() {
    if (!jwt || !provider) return;
    const start = prefilledWindow?.startTime ?? new Date().toISOString();
    const end = prefilledWindow?.endTime ?? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    await careRepository.createBooking({
      providerId: provider.id,
      userId: jwt.user.id,
      startTime: start,
      endTime: end,
      contextBookingId: prefilledWindow?.contextBookingId,
    });
    router.back();
  }

  if (isLoading) return <ActivityIndicator style={styles.loader} />;
  if (!provider) return <Text style={styles.notFound}>Provider not found</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{provider.displayName}</Text>
      <Text style={styles.meta}>{provider.service} · ${provider.hourlyRate}/hr</Text>
      <Text style={styles.hint}>Exact address hidden until your booking is CONFIRMED.</Text>
      <Pressable style={styles.primaryButton} onPress={handleRequestBooking}>
        <Text style={styles.primaryButtonText}>Request booking</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 80, gap: 8 },
  loader: { marginTop: 100 },
  notFound: { marginTop: 100, textAlign: 'center', color: '#666' },
  title: { fontSize: 22, fontWeight: '700' },
  meta: { color: '#444' },
  hint: { color: '#999', fontSize: 12, marginBottom: 16 },
  primaryButton: { padding: 14, borderRadius: 10, backgroundColor: '#111', alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
});
