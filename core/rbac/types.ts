export type Role = 'guest' | 'member' | 'host';

export interface SessionUser {
  id: string;
  displayName: string;
  role: Role;
}

export interface MockJwt {
  token: string;
  user: SessionUser;
  issuedAt: string;
}

/** Route-level permission a screen declares via `requireRole` in its layout. */
export function roleCanAccess(userRole: Role, required: Role): boolean {
  const rank: Record<Role, number> = { guest: 0, member: 1, host: 2 };
  return rank[userRole] >= rank[required];
}
