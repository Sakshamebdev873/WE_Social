import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { ModuleSwitcher } from '@core/ui/ModuleSwitcher';
import { SkeletonList } from '@core/ui/Skeleton';
import { EmptyState } from '@core/ui/EmptyState';
import { useEvents } from '@modules/events/hooks/useEvents';
import { useEventsStore } from '@modules/events/store/eventsStore';

export default function EventsHome() {
  const { data: events, isLoading, refetch } = useEvents();
  const { savedEventIds, toggleSaved } = useEventsStore();

  return (
    <View style={styles.container}>
      <ModuleSwitcher active="events" />
      <Text style={styles.title}>Community Events</Text>

      {isLoading && <SkeletonList rows={3} />}

      {!isLoading && (events ?? []).length === 0 && (
        <EmptyState
          title="No events nearby"
          body="Nothing scheduled right now — refresh to check again."
          actionLabel="Refresh"
          onAction={() => void refetch()}
        />
      )}

      {!isLoading && (events ?? []).length > 0 && (
        <FlatList
          data={events ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 10, padding: 16 }}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => toggleSaved(item.id)}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>
                {item.location} · {new Date(item.startTime).toLocaleDateString()}
              </Text>
              <Text style={styles.saved}>{savedEventIds.has(item.id) ? '★ Saved' : '☆ Save'}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: '700', paddingHorizontal: 16 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardMeta: { fontSize: 13, color: '#666' },
  saved: { fontSize: 13, color: '#b8860b', marginTop: 4 },
});
