import { initializeApp } from 'firebase-admin/app';
import { getAuth, UserRecord } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import {
  DEMO_PASSWORD,
  SEED_GYM_SETTINGS,
  SEED_MEMBERSHIP_PLANS,
  SEED_USERS,
  SeedUser,
} from './seed-data';

export async function runSeed(projectId: string): Promise<void> {
  const app = initializeApp({ projectId });
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log(`Seeding emulators for project "${projectId}"…\n`);

  for (const user of SEED_USERS) {
    const record = await upsertAuthUser(auth, user);
    await auth.setCustomUserClaims(record.uid, { role: user.role });
    await db
      .collection('users')
      .doc(record.uid)
      .set(
        {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone ?? null,
          role: user.role,
          active: true,
          joinDate: FieldValue.serverTimestamp(),
          features: user.features,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    console.log(`  ✔ ${user.role.padEnd(7)} ${user.email}`);
  }

  await db
    .collection('gymSettings')
    .doc('public')
    .set({ ...SEED_GYM_SETTINGS, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  console.log('  ✔ gymSettings/public');

  for (const plan of SEED_MEMBERSHIP_PLANS) {
    const { id, ...data } = plan;
    await db
      .collection('membershipPlans')
      .doc(id)
      .set({ ...data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  }
  console.log(`  ✔ ${SEED_MEMBERSHIP_PLANS.length} membership plans`);

  console.log(`\nDone. Demo password for every user (LOCAL ONLY): ${DEMO_PASSWORD}`);
}

async function upsertAuthUser(
  auth: ReturnType<typeof getAuth>,
  user: SeedUser,
): Promise<UserRecord> {
  const displayName = `${user.firstName} ${user.lastName}`;
  try {
    const existing = await auth.getUserByEmail(user.email);
    return auth.updateUser(existing.uid, {
      displayName,
      password: DEMO_PASSWORD,
      disabled: false,
    });
  } catch (error) {
    if (isUserNotFound(error)) {
      return auth.createUser({
        email: user.email,
        emailVerified: true,
        password: DEMO_PASSWORD,
        displayName,
      });
    }
    throw error;
  }
}

function isUserNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 'auth/user-not-found'
  );
}
