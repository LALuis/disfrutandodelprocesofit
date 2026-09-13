import { describe, expect, it } from 'vitest';
import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import { parseUserRole, requireAuth, requireRole } from './auth';

interface FakeAuth {
  readonly uid: string;
  readonly token: Record<string, unknown>;
}

/** Builds the minimal CallableRequest shape the helpers inspect. */
function requestWith(auth: FakeAuth | undefined): CallableRequest<unknown> {
  return { data: {}, rawRequest: {}, auth } as unknown as CallableRequest<unknown>;
}

function callerWithRole(role: unknown): CallableRequest<unknown> {
  return requestWith({ uid: 'user-1', token: { email: 'user@gym.local', role } });
}

function codeOf(fn: () => unknown): string | undefined {
  try {
    fn();
    return undefined;
  } catch (error) {
    return error instanceof HttpsError ? error.code : 'not-an-https-error';
  }
}

describe('parseUserRole', () => {
  it('accepts known roles and rejects anything else', () => {
    expect(parseUserRole('ADMIN')).toBe('ADMIN');
    expect(parseUserRole('STUDENT')).toBe('STUDENT');
    expect(parseUserRole('admin')).toBeNull();
    expect(parseUserRole(undefined)).toBeNull();
    expect(parseUserRole(42)).toBeNull();
  });
});

describe('requireAuth', () => {
  it('rejects anonymous callers with "unauthenticated"', () => {
    expect(codeOf(() => requireAuth(requestWith(undefined)))).toBe('unauthenticated');
  });

  it('returns uid, email and parsed role for authenticated callers', () => {
    expect(requireAuth(callerWithRole('STUDENT'))).toEqual({
      uid: 'user-1',
      email: 'user@gym.local',
      role: 'STUDENT',
    });
  });

  it('maps a missing or unknown role claim to null', () => {
    expect(requireAuth(callerWithRole(undefined)).role).toBeNull();
    expect(requireAuth(callerWithRole('SUPERUSER')).role).toBeNull();
  });
});

describe('requireRole', () => {
  it('rejects anonymous callers before checking the role', () => {
    expect(codeOf(() => requireRole(requestWith(undefined), 'ADMIN'))).toBe('unauthenticated');
  });

  it('rejects callers with a different role with "permission-denied"', () => {
    expect(codeOf(() => requireRole(callerWithRole('STUDENT'), 'ADMIN'))).toBe('permission-denied');
    expect(codeOf(() => requireRole(callerWithRole(undefined), 'STUDENT'))).toBe(
      'permission-denied',
    );
  });

  it('allows callers with the expected role', () => {
    expect(requireRole(callerWithRole('ADMIN'), 'ADMIN').role).toBe('ADMIN');
  });
});
