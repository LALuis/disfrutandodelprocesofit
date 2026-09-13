import { HttpsError } from 'firebase-functions/v2/https';

/**
 * Structured errors returned to the client. Keeping the factories here guarantees every
 * function uses the same codes and messages, and that messages never leak internals.
 */
export function unauthenticatedError(): HttpsError {
  return new HttpsError('unauthenticated', 'Tenés que iniciar sesión para realizar esta acción.');
}

export function forbiddenError(
  message = 'No tenés permisos para realizar esta acción.',
): HttpsError {
  return new HttpsError('permission-denied', message);
}
