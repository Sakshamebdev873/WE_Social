import React from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from '@core/session/SessionProvider';

// One QueryClient for the app; module isolation is enforced by namespacing
// query keys per module (['sports', ...], ['care', ...]) and by the fact that
// no module's hooks/repositories import another module's files. A shared
// client just avoids duplicating cache plumbing for no isolation benefit.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SessionProvider>
    </QueryClientProvider>
  );
}
