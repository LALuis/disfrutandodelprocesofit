import { randomBytes } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { onCall } from 'firebase-functions/v2/https';
import { requireRole, ROLE_CLAIM } from '../shared/auth';
import { conflictError } from '../shared/errors';
import { adminAuth, adminDb, COLLECTIONS } from '../shared/firebase-admin';
import {
  asRecord,
  optionalBoolean,
  optionalIsoDate,
  optionalString,
  requireEmail,
  requireString,
} from '../shared/validation';

export interface CreateStudentResponse {
  readonly uid: string;
  /**
   * One-time link the admin can share so the student sets their own password.
   * The account is created with a random password that is never revealed.
   */
  readonly passwordSetupLink: string;
}

/**
 * Admin-only onboarding: creates the Auth user, assigns the STUDENT claim and writes the
 * Firestore profile. Clients cannot do any of this directly (rules deny `users` creates).
 */
export const createStudent = onCall<unknown, Promise<CreateStudentResponse>>(async (request) => {
  requireRole(request, 'ADMIN');
  const data = asRecord(request.data);

  const email = requireEmail(data);
  const firstName = requireString(data, 'firstName', 'El nombre', 80);
  const lastName = requireString(data, 'lastName', 'El apellido', 80);
  const phone = optionalString(data, 'phone', 'El teléfono', 40);
  const birthDate = optionalIsoDate(data, 'birthDate', 'La fecha de nacimiento');
  const joinDate =
    optionalIsoDate(data, 'joinDate', 'La fecha de ingreso') ||
    new Date().toISOString().slice(0, 10);
  const notes = optionalString(data, 'notes', 'Las notas', 2000);
  const featuresInput = asRecordOrEmpty(data['features']);
  const features = {
    nutritionEnabled: optionalBoolean(featuresInput, 'nutritionEnabled', false),
    recipesEnabled: optionalBoolean(featuresInput, 'recipesEnabled', false),
  };

  const auth = adminAuth();
  if (await emailExists(email)) {
    throw conflictError('Ya existe una cuenta con ese email.');
  }

  const user = await auth.createUser({
    email,
    emailVerified: false,
    password: randomPassword(),
    displayName: `${firstName} ${lastName}`,
    disabled: false,
  });
  await auth.setCustomUserClaims(user.uid, { [ROLE_CLAIM]: 'STUDENT' });

  await adminDb().collection(COLLECTIONS.users).doc(user.uid).set({
    firstName,
    lastName,
    email,
    phone,
    birthDate,
    joinDate,
    notes,
    role: 'STUDENT',
    active: true,
    features,
    activeTrainingPlanId: null,
    activeNutritionPlanId: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const passwordSetupLink = await auth.generatePasswordResetLink(email);
  return { uid: user.uid, passwordSetupLink };
});

async function emailExists(email: string): Promise<boolean> {
  try {
    await adminAuth().getUserByEmail(email);
    return true;
  } catch (error) {
    if (isAuthError(error, 'auth/user-not-found')) {
      return false;
    }
    throw error;
  }
}

function isAuthError(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: string }).code === code;
}

function randomPassword(): string {
  return randomBytes(24).toString('base64url');
}

function asRecordOrEmpty(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}
