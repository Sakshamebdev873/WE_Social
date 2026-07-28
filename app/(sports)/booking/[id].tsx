import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSession } from '@core/session/SessionProvider';
import { useCreateSportsBooking } from '@modules/sports/hooks/useCreateSportsBooking';
import { buildCareSuggestionHref } from '@core/crossModule/bookingBridge';
import type { SportsBooking } from '@modules/sports/types';

const SESSION_LENGTH_HOURS = 2;

export default function SportsBookingScreen() {
  const { id: coachId } = useLocalSearchParams<{ id: string }>();
  const { jwt } = useSession();
  const createBooking = useCreateSportsBooking();
  const [confirmed, setConfirmed] = useState<SportsBooking | null>(null);

  async function handleBook() {
    if (!jwt || !coachId) return;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + SESSION_LENGTH_HOURS * 60 * 60 * 1000);
    const booking = await createBooking.mutateAsync({
      coachId,
      userId: jwt.user.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    });
    setConfirmed(booking);
  }

  if (confirmed) {
    const careHref = buildCareSuggestionHref({
      contextModule: 'sports',
      contextBookingId: confirmed.id,
      startTime: confirmed.startTime,
      endTime: confirmed.endTime,
    });

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Session booked ✅</Text>
        <Text style={styles.body}>
          {new Date(confirmed.startTime).toLocaleTimeString()} –{' '}
          {new Date(confirmed.endTime).toLocaleTimeString()}
        </Text>

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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book a {SESSION_LENGTH_HOURS}-hour session</Text>
      <Text style={styles.body}>Coach: {coachId}</Text>
      <Pressable
        style={styles.primaryButton}
        onPress={handleBook}
        disabled={createBooking.isPending}
      >
        <Text style={styles.primaryButtonText}>
          {createBooking.isPending ? 'Booking…' : 'Confirm booking'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 80, gap: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  body: { color: '#444' },
  primaryButton: { marginTop: 16, padding: 14, borderRadius: 10, backgroundColor: '#111', alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  promptCard: { marginTop: 24, padding: 16, borderRadius: 12, backgroundColor: '#fff7e6', gap: 8 },
  promptTitle: { fontWeight: '700', fontSize: 15 },
  promptBody: { color: '#555', fontSize: 13 },
  link: { marginTop: 20, textAlign: 'center', color: '#555' },
});
