/** Roles are stored as Firebase custom claims and set only from trusted backend code. */
export const USER_ROLES = ['ADMIN', 'STUDENT'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Name of the custom claim that carries the role. Shared contract with Cloud Functions. */
export const ROLE_CLAIM = 'role';

export interface AuthUser {
  readonly uid: string;
  readonly email: string | null;
  readonly displayName: string | null;
  /** `null` when the account exists but no role has been assigned yet. */
  readonly role: UserRole | null;
}

export function parseUserRole(value: unknown): UserRole | null {
  return USER_ROLES.find((role) => role === value) ?? null;
}

/** Landing route for an authenticated user, based on their role. */
export function homeRouteForRole(role: UserRole | null): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'STUDENT':
      return '/app';
    default:
      return '/unauthorized';
  }
}
