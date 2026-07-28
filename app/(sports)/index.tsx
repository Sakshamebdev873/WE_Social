import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ModuleSwitcher } from '@core/ui/ModuleSwitcher';
import { useSportsCoaches } from '@modules/sports/hooks/useSportsCoaches';

export default function SportsHome() {
  const { data: coaches, isLoading } = useSportsCoaches();

  return (
    <View style={styles.container}>
      <ModuleSwitcher active="sports" />
      <Text style={styles.title}>Sports Coaches</Text>
      {isLoading && <Text style={styles.muted}>Loading coaches…</Text>}
      <FlatList
        data={coaches ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, padding: 16 }}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/(sports)/booking/${item.id}`)}>
            <Text style={styles.cardTitle}>{item.displayName}</Text>
            <Text style={styles.cardMeta}>{item.sport} · ${item.hourlyRate}/hr</Text>
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
  card: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#ddd' },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardMeta: { fontSize: 13, color: '#666', marginTop: 4 },
});
