import { FirebaseError } from 'firebase/app';
import { mapAuthError } from './auth-error.mapper';

describe('mapAuthError', () => {
  it('maps credential errors to one generic message (no user enumeration)', () => {
    const expected = 'Email o contraseña incorrectos.';
    expect(mapAuthError(new FirebaseError('auth/invalid-credential', ''))).toBe(expected);
    expect(mapAuthError(new FirebaseError('auth/user-not-found', ''))).toBe(expected);
    expect(mapAuthError(new FirebaseError('auth/wrong-password', ''))).toBe(expected);
  });

  it('maps disabled accounts and throttling to specific messages', () => {
    expect(mapAuthError(new FirebaseError('auth/user-disabled', ''))).toContain('deshabilitada');
    expect(mapAuthError(new FirebaseError('auth/too-many-requests', ''))).toContain(
      'Demasiados intentos',
    );
  });

  it('falls back to a generic message for unknown codes and non-Firebase errors', () => {
    const fallback = mapAuthError(new Error('boom'));
    expect(fallback).toContain('inesperado');
    expect(mapAuthError(new FirebaseError('auth/something-new', ''))).toBe(fallback);
    expect(mapAuthError('string error')).toBe(fallback);
  });
});
