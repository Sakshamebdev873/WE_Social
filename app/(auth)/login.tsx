import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSession } from '@core/session/SessionProvider';
import type { Role } from '@core/rbac/types';

const ROLES: { role: Role; label: string; description: string }[] = [
  { role: 'guest', label: 'Continue as Guest', description: 'Browse only, no bookings or hosting' },
  { role: 'member', label: 'Continue as Member', description: 'Can book Sports, Events, and Care' },
  { role: 'host', label: 'Continue as Host', description: 'Can also create listings' },
];

export default function LoginScreen() {
  const { signIn } = useSession();

  async function handleSelect(role: Role) {
    await signIn(role);
    router.replace('/(sports)');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WeSocial</Text>
      <Text style={styles.subtitle}>Mock sign-in — pick a role to demo RBAC routing</Text>
      {ROLES.map((r) => (
        <Pressable key={r.role} style={styles.card} onPress={() => handleSelect(r.role)}>
          <Text style={styles.cardTitle}>{r.label}</Text>
          <Text style={styles.cardDesc}>{r.description}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontSize: 32, fontWeight: '700', textAlign: 'center' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 16 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardDesc: { fontSize: 13, color: '#666' },
});
