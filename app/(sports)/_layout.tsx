import { Stack } from 'expo-router';
import { RequireRole } from '@core/rbac/RequireRole';

export default function SportsLayout() {
  return (
    <RequireRole role="guest">
      <Stack screenOptions={{ headerShown: false }} />
    </RequireRole>
  );
}
