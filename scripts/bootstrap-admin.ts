/**
 * Grants the ADMIN role to an existing Firebase Auth user and creates/merges their profile.
 * Intended for the very first administrator of a real project, run by the project owner:
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json \
 *   FIREBASE_PROJECT_ID=your-project-id \
 *   npx tsx scripts/bootstrap-admin.ts admin@example.com --yes
 *
 * The user must already exist in Authentication (create it from the Firebase console with
 * email + password). Against the emulators, set FIREBASE_AUTH_EMULATOR_HOST and
 * FIRESTORE_EMULATOR_HOST instead of the credentials.
 */
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

async function main(): Promise<void> {
  const [email, flag] = process.argv.slice(2);
  const projectId = process.env['FIREBASE_PROJECT_ID'] ?? process.env['GCLOUD_PROJECT'];
  const usingEmulators = !!process.env['FIREBASE_AUTH_EMULATOR_HOST'];

  if (!email || !email.includes('@')) {
    throw new Error('Usage: bootstrap-admin.ts <email> --yes');
  }
  if (!projectId) {
    throw new Error('Set FIREBASE_PROJECT_ID (or GCLOUD_PROJECT).');
  }
  if (!usingEmulators && !process.env['GOOGLE_APPLICATION_CREDENTIALS']) {
    throw new Error(
      'Set GOOGLE_APPLICATION_CREDENTIALS to a service account key of the target project.',
    );
  }
  if (flag !== '--yes') {
    throw new Error(
      `About to grant ADMIN to ${email} on project "${projectId}"${usingEmulators ? ' (emulators)' : ''}. Re-run with --yes to confirm.`,
    );
  }

  const app = initializeApp({ projectId });
  const auth = getAuth(app);
  const db = getFirestore(app);

  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { role: 'ADMIN' });
  const [firstName = 'Admin', ...rest] = (user.displayName ?? '').split(' ');
  await db
    .collection('users')
    .doc(user.uid)
    .set(
      {
        firstName,
        lastName: rest.join(' '),
        email: user.email,
        role: 'ADMIN',
        active: true,
        features: { nutritionEnabled: false, recipesEnabled: false },
        activeTrainingPlanId: null,
        activeNutritionPlanId: null,
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

  console.log(
    `✔ ${email} (${user.uid}) is now ADMIN on "${projectId}". Sign out and in again to refresh the token.`,
  );
}

main().catch((error: unknown) => {
  console.error(`✖ ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
