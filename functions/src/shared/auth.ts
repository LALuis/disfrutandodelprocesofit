import { CallableRequest } from 'firebase-functions/v2/https';
import { forbiddenError, unauthenticatedError } from './errors';

/** Must stay in sync with `src/app/core/auth/auth.models.ts` in the Angular app. */
export const USER_ROLES = ['ADMIN', 'STUDENT'] as const;
export type UserRole = (typeof USER_ROLES)[number];
export const ROLE_CLAIM = 'role';

export interface AuthenticatedCaller {
  readonly uid: string;
  readonly email: string | undefined;
  readonly role: UserRole | null;
}

export function parseUserRole(value: unknown): UserRole | null {
  return USER_ROLES.find((role) => role === value) ?? null;
}

/** Throws `unauthenticated` when the callable was invoked without a valid ID token. */
export function requireAuth(request: CallableRequest<unknown>): AuthenticatedCaller {
  const auth = request.auth;
  if (!auth) {
    throw unauthenticatedError();
  }
  return {
    uid: auth.uid,
    email: auth.token.email,
    role: parseUserRole(auth.token[ROLE_CLAIM]),
  };
}

/** Throws `permission-denied` unless the caller carries the given role claim. */
export function requireRole(
  request: CallableRequest<unknown>,
  role: UserRole,
): AuthenticatedCaller {
  const caller = requireAuth(request);
  if (caller.role !== role) {
    throw forbiddenError();
  }
  return caller;
}
