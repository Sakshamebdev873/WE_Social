import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { MockJwt, Role } from '@core/rbac/types';
import { loadSession, signInAs, signOut } from './session';

interface SessionContextValue {
  jwt: MockJwt | null;
  isBootstrapping: boolean;
  signIn: (role: Role) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [jwt, setJwt] = useState<MockJwt | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadSession().then((session) => {
      if (!cancelled) {
        setJwt(session);
        setIsBootstrapping(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      jwt,
      isBootstrapping,
      signIn: async (role: Role) => {
        const next = await signInAs(role);
        setJwt(next);
      },
      signOut: async () => {
        await signOut();
        setJwt(null);
      },
    }),
    [jwt, isBootstrapping]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
