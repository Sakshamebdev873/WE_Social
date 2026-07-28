import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RequireRole } from '@core/rbac/RequireRole';

// Guarded a second time at screen level (on top of the module's guest-level
// gate in app/(care)/_layout.tsx) because this specific screen needs "host",
// a strictly higher bar than the rest of the Care module. A Guest or Member
// hitting this route is redirected to /(auth)/forbidden before this body
// ever renders — there is no button to hide, the route itself is unreachable.
export default function NewCareListingScreen() {
  return (
    <RequireRole role="host">
      <View style={styles.container}>
        <Text style={styles.title}>Create Care Listing</Text>
        <Text style={styles.body}>
          Host-only screen. Listing creation form (service type, hourly rate, exact address) would go
          here — stubbed for this prototype since the assessment scope prioritizes the booking/geo/offline
          logic over CRUD forms.
        </Text>
      </View>
    </RequireRole>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 80, gap: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  body: { color: '#555', lineHeight: 20 },
});
