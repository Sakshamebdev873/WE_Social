import React from 'react';
import { Redirect } from 'expo-router';
import { useSession } from '@core/session/SessionProvider';
import { roleCanAccess, type Role } from './types';

/**
 * Route guard: wrap any screen/layout that needs a minimum role. A user whose
 * role doesn't qualify is redirected before the screen (or its data hooks)
 * ever mounts — this is what makes "guest cannot navigate to host screen" a
 * navigation-level guarantee rather than a hidden button.
 */
export function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { jwt, isBootstrapping } = useSession();

  if (isBootstrapping) return null;

  if (!jwt) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!roleCanAccess(jwt.user.role, role)) {
    return <Redirect href="/(auth)/forbidden" />;
  }

  return <>{children}</>;
}
