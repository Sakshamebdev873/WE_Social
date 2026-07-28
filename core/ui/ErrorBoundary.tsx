import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  retryKey: number;
}

/**
 * Shared across all three modules. On retry, remounts the subtree (via
 * `retryKey`) instead of just clearing the error flag — that forces
 * useQuery/useEffect in the failed subtree to actually re-run, not just
 * re-render stale state.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null, retryKey: 0 };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    if (__DEV__) {
      console.error('ErrorBoundary caught:', error, info.componentStack);
    }
  }

  handleRetry = (): void => {
    this.setState((prev) => ({ error: null, retryKey: prev.retryKey + 1 }));
  };

  override render(): React.ReactNode {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.body}>{this.state.error.message}</Text>
          <Pressable style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    return <View key={this.state.retryKey} style={styles.fill}>{this.props.children}</View>;
  }
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  container: { flex: 1, padding: 32, justifyContent: 'center', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#a3242c' },
  body: { fontSize: 13, color: '#666', textAlign: 'center' },
  button: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, backgroundColor: '#111' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
