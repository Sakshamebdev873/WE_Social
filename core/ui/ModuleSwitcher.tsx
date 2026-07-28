import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

const MODULES = [
  { key: 'sports', label: 'Sports', href: '/(sports)' },
  { key: 'events', label: 'Events', href: '/(events)' },
  { key: 'care', label: 'Care', href: '/(care)' },
] as const;

/**
 * Lightweight module switcher shared by all three mini-app root screens.
 * Each module keeps its own independent Stack navigator underneath — this
 * only changes which stack is mounted, it holds no shared state itself.
 */
export function ModuleSwitcher({ active }: { active: 'sports' | 'events' | 'care' }) {
  return (
    <View style={styles.row}>
      {MODULES.map((m) => (
        <Pressable
          key={m.key}
          onPress={() => router.replace(m.href)}
          style={[styles.tab, active === m.key && styles.tabActive]}
        >
          <Text style={[styles.label, active === m.key && styles.labelActive]}>{m.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, padding: 12, paddingTop: 56 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f0f0f0', alignItems: 'center' },
  tabActive: { backgroundColor: '#111' },
  label: { fontWeight: '600', color: '#333' },
  labelActive: { color: '#fff' },
});
