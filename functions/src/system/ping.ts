import { onCall } from 'firebase-functions/v2/https';
import { requireAuth } from '../shared/auth';

export interface PingResponse {
  readonly ok: true;
  readonly serverTime: string;
  readonly uid: string;
  readonly role: string | null;
}

/**
 * Health check used to verify the Angular ↔ Functions ↔ Auth wiring (emulator and prod).
 * Requires a signed-in caller so it also proves that ID tokens and claims reach the backend.
 */
export const ping = onCall<unknown, PingResponse>((request) => {
  const caller = requireAuth(request);
  return {
    ok: true,
    serverTime: new Date().toISOString(),
    uid: caller.uid,
    role: caller.role,
  };
});
