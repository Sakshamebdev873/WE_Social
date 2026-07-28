import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function ForbiddenScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Access denied</Text>
      <Text style={styles.body}>Your role does not have permission to view this screen.</Text>
      <Pressable style={styles.button} onPress={() => router.replace('/(sports)')}>
        <Text style={styles.buttonText}>Back to Sports</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  body: { textAlign: 'center', color: '#666' },
  button: { marginTop: 16, padding: 12, borderRadius: 8, backgroundColor: '#111' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
