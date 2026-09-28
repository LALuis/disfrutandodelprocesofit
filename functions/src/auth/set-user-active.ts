import { FieldValue } from 'firebase-admin/firestore';
import { onCall } from 'firebase-functions/v2/https';
import { requireRole } from '../shared/auth';
import { failedPreconditionError, notFoundError } from '../shared/errors';
import { adminAuth, adminDb, COLLECTIONS } from '../shared/firebase-admin';
import { asRecord, requireBoolean, requireString } from '../shared/validation';

/**
 * Enables or disables a student account. Disabling revokes Auth sign-in (server-side) and
 * flags the profile, so both the login and the data rules stop working for that user.
 */
export const setUserActive = onCall<unknown, Promise<{ active: boolean }>>(async (request) => {
  const caller = requireRole(request, 'ADMIN');
  const data = asRecord(request.data);
  const userId = requireString(data, 'userId', 'El usuario', 128);
  const active = requireBoolean(data, 'active', 'El estado');

  if (userId === caller.uid) {
    throw failedPreconditionError('No podés deshabilitar tu propia cuenta.');
  }

  const profileRef = adminDb().collection(COLLECTIONS.users).doc(userId);
  const profile = await profileRef.get();
  if (!profile.exists) {
    throw notFoundError('El usuario no existe.');
  }

  await adminAuth().updateUser(userId, { disabled: !active });
  if (!active) {
    // Invalidate sessions already issued so the change is effective immediately.
    await adminAuth().revokeRefreshTokens(userId);
  }
  await profileRef.update({ active, updatedAt: FieldValue.serverTimestamp() });
  return { active };
});
