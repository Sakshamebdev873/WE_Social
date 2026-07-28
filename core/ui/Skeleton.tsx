import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, View, type DimensionValue } from 'react-native';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: object;
}

/** Single shimmering placeholder block. Compose several for a list/card skeleton. */
export function Skeleton({ width = '100%', height = 16, borderRadius = 6, style }: SkeletonProps) {
  const [opacity] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: '#e2e2e2', opacity },
        style,
      ]}
    />
  );
}

/** Stack of Skeleton rows shaped like a card list — used by every module's home screen. */
export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.card}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} style={{ marginTop: 8 }} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, padding: 16 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
});
