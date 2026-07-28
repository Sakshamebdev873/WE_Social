import React, { useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ModuleSwitcher } from '@core/ui/ModuleSwitcher';
import { useCareProviders } from '@modules/care/hooks/useCareProviders';
import { useCareStore } from '@modules/care/store/careStore';
import { useSession } from '@core/session/SessionProvider';
import { parseCareSuggestionParams } from '@core/crossModule/bookingBridge';

export default function CareHome() {
  const { data: providers, isLoading } = useCareProviders();
  const { prefilledWindow, setPrefilledWindow } = useCareStore();
  const rawParams = useLocalSearchParams<Record<string, string>>();
  const { jwt } = useSession();

  useEffect(() => {
    const parsed = parseCareSuggestionParams(rawParams);
    if (parsed) {
      setPrefilledWindow({
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        contextBookingId: parsed.contextBookingId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawParams.contextBookingId]);

  return (
    <View style={styles.container}>
      <ModuleSwitcher active="care" />
      <Text style={styles.title}>Care Providers</Text>

      {prefilledWindow && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Showing availability for {new Date(prefilledWindow.startTime).toLocaleTimeString()} –{' '}
            {new Date(prefilledWindow.endTime).toLocaleTimeString()} (from your Sports booking)
          </Text>
          <Pressable onPress={() => setPrefilledWindow(null)}>
            <Text style={styles.bannerClear}>Clear</Text>
          </Pressable>
        </View>
      )}

      {isLoading && <Text style={styles.muted}>Loading providers…</Text>}

      {jwt?.user.role === 'host' && (
        <Pressable style={styles.hostButton} onPress={() => router.push('/(care)/host/new-listing')}>
          <Text style={styles.hostButtonText}>+ Create Care listing (Host)</Text>
        </Pressable>
      )}

      <FlatList
        data={providers ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, padding: 16 }}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/(care)/provider/${item.id}`)}>
            <Text style={styles.cardTitle}>{item.displayName}</Text>
            <Text style={styles.cardMeta}>{item.service} · ${item.hourlyRate}/hr</Text>
            <Text style={styles.cardHint}>Exact location hidden until booking is confirmed</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: '700', paddingHorizontal: 16 },
  muted: { color: '#666', paddingHorizontal: 16, paddingTop: 8 },
  banner: { marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 10, backgroundColor: '#eef6ff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bannerText: { flex: 1, fontSize: 12, color: '#1a4d8f' },
  bannerClear: { fontSize: 12, fontWeight: '600', color: '#1a4d8f', marginLeft: 8 },
  hostButton: { marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 10, backgroundColor: '#111', alignItems: 'center' },
  hostButtonText: { color: '#fff', fontWeight: '600' },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardMeta: { fontSize: 13, color: '#666' },
  cardHint: { fontSize: 11, color: '#999', marginTop: 2 },
});
