import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface EmptyStateProps {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {body && <Text style={styles.body}>{body}</Text>}
      {actionLabel && onAction && (
        <Pressable style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 32, alignItems: 'center', gap: 8 },
  title: { fontSize: 15, fontWeight: '600', color: '#333', textAlign: 'center' },
  body: { fontSize: 13, color: '#777', textAlign: 'center' },
  button: { marginTop: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#111' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
