import * as SecureStore from 'expo-secure-store';
import type { MockJwt, Role, SessionUser } from '@core/rbac/types';

const SESSION_KEY = 'wesocial.session.v1';

function makeMockToken(user: SessionUser): MockJwt {
  return {
    token: `mock.${user.id}.${Date.now()}`,
    user,
    issuedAt: new Date().toISOString(),
  };
}

export async function loadSession(): Promise<MockJwt | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MockJwt;
  } catch {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return null;
  }
}

export async function signInAs(role: Role): Promise<MockJwt> {
  const user: SessionUser = {
    id: `${role}-${Math.random().toString(36).slice(2, 8)}`,
    displayName: role === 'host' ? 'Host Demo' : role === 'member' ? 'Member Demo' : 'Guest',
    role,
  };
  const jwt = makeMockToken(user);
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(jwt));
  return jwt;
}

export async function signOut(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
