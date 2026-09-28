import { getApps, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

/**
 * Lazily initialised Admin SDK. Inside Cloud Functions (and the emulator) credentials and
 * project id come from the runtime, so no configuration is needed here.
 */
function app() {
  return getApps()[0] ?? initializeApp();
}

export function adminAuth(): Auth {
  return getAuth(app());
}

export function adminDb(): Firestore {
  return getFirestore(app());
}

/** Collection names shared by every function. Must match the Angular services. */
export const COLLECTIONS = {
  users: 'users',
  bookings: 'bookings',
  scheduleSlots: 'scheduleSlots',
} as const;
