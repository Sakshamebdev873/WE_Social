import React from 'react';
import { Redirect } from 'expo-router';
import { useSession } from '@core/session/SessionProvider';

export default function Index() {
  const { jwt, isBootstrapping } = useSession();

  if (isBootstrapping) return null;
  if (!jwt) return <Redirect href="/(auth)/login" />;

  return <Redirect href="/(sports)" />;
}
