import { FieldValue } from 'firebase-admin/firestore';
import { onCall } from 'firebase-functions/v2/https';
import { parseUserRole, requireRole, ROLE_CLAIM, UserRole } from '../shared/auth';
import { failedPreconditionError, invalidArgumentError, notFoundError } from '../shared/errors';
import { adminAuth, adminDb, COLLECTIONS } from '../shared/firebase-admin';
import { asRecord, requireString } from '../shared/validation';

/**
 * Changes a user's role (custom claim + profile copy). Admin-only; an admin cannot change
 * their own role, which guarantees at least one admin always remains.
 */
export const setUserRole = onCall<unknown, Promise<{ role: UserRole }>>(async (request) => {
  const caller = requireRole(request, 'ADMIN');
  const data = asRecord(request.data);
  const userId = requireString(data, 'userId', 'El usuario', 128);
  const role = parseUserRole(data['role']);
  if (!role) {
    throw invalidArgumentError('El rol es inválido.');
  }
  if (userId === caller.uid) {
    throw failedPreconditionError('No podés cambiar tu propio rol.');
  }

  const profileRef = adminDb().collection(COLLECTIONS.users).doc(userId);
  const profile = await profileRef.get();
  if (!profile.exists) {
    throw notFoundError('El usuario no existe.');
  }

  await adminAuth().setCustomUserClaims(userId, { [ROLE_CLAIM]: role });
  await profileRef.update({ role, updatedAt: FieldValue.serverTimestamp() });
  return { role };
});
