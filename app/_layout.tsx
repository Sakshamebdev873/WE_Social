import React from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from '@core/session/SessionProvider';
import { SyncEngineProvider } from '@core/offline/SyncEngineProvider';
import { ErrorBoundary } from '@core/ui/ErrorBoundary';

// One QueryClient for the app; module isolation is enforced by namespacing
// query keys per module (['sports', ...], ['care', ...]) and by the fact that
// no module's hooks/repositories import another module's files. A shared
// client just avoids duplicating cache plumbing for no isolation benefit.
//
// throwOnError: list queries surface genuine fetch failures to the
// ErrorBoundary below (with a Retry that remounts and re-fetches) instead of
// silently sitting in an unhandled `isError` state.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, throwOnError: true },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SyncEngineProvider>
          <ErrorBoundary>
            <Stack screenOptions={{ headerShown: false }} />
          </ErrorBoundary>
        </SyncEngineProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
