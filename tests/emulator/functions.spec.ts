import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { deleteApp, FirebaseApp, FirebaseError, initializeApp } from 'firebase/app';
import {
  Auth,
  connectAuthEmulator,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  connectFunctionsEmulator,
  Functions,
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import { PAST, PORTS, PROJECT_ID, profileDoc, slotDoc } from './helpers';

// The Admin SDK must see the emulator hosts before it is imported.
process.env['GCLOUD_PROJECT'] = PROJECT_ID;
process.env['FIREBASE_AUTH_EMULATOR_HOST'] = `${PORTS.host}:${PORTS.auth}`;
process.env['FIRESTORE_EMULATOR_HOST'] = `${PORTS.host}:${PORTS.firestore}`;
process.env['METADATA_SERVER_DETECTION'] = 'none';

const { getApps, initializeApp: initializeAdminApp } = await import('firebase-admin/app');
const { getAuth: getAdminAuth } = await import('firebase-admin/auth');
const { getFirestore: getAdminFirestore } = await import('firebase-admin/firestore');

const adminApp = getApps()[0] ?? initializeAdminApp({ projectId: PROJECT_ID });
const adminAuth = getAdminAuth(adminApp);
const adminDb = getAdminFirestore(adminApp);

const PASSWORD = 'test-pass-123';

interface TestUser {
  readonly uid: string;
  readonly email: string;
  readonly role: 'ADMIN' | 'STUDENT';
}

const users: Record<'admin' | 'alice' | 'bob' | 'inactive', TestUser> = {
  admin: { uid: 'fn-admin', email: 'fn-admin@gym.local', role: 'ADMIN' },
  alice: { uid: 'fn-alice', email: 'fn-alice@gym.local', role: 'STUDENT' },
  bob: { uid: 'fn-bob', email: 'fn-bob@gym.local', role: 'STUDENT' },
  inactive: { uid: 'fn-inactive', email: 'fn-inactive@gym.local', role: 'STUDENT' },
};

/** One client app per user so several sessions can act concurrently. */
class Client {
  readonly app: FirebaseApp;
  readonly auth: Auth;
  readonly functions: Functions;

  constructor(name: string) {
    this.app = initializeApp({ apiKey: 'demo', projectId: PROJECT_ID }, name);
    this.auth = getAuth(this.app);
    connectAuthEmulator(this.auth, `http://${PORTS.host}:${PORTS.auth}`, { disableWarnings: true });
    this.functions = getFunctions(this.app, 'us-central1');
    connectFunctionsEmulator(this.functions, PORTS.host, PORTS.functions);
  }

  async signIn(user: TestUser): Promise<void> {
    await signInWithEmailAndPassword(this.auth, user.email, PASSWORD);
  }

  call<T, R>(name: string, data: T): Promise<R> {
    return httpsCallable<T, R>(this.functions, name)(data).then((r) => r.data);
  }

  async dispose(): Promise<void> {
    await signOut(this.auth).catch(() => undefined);
    await deleteApp(this.app);
  }
}

async function codeOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
    return 'ok';
  } catch (error) {
    return error instanceof FirebaseError ? error.code.replace('functions/', '') : String(error);
  }
}

async function ensureUser(user: TestUser, active = true): Promise<void> {
  try {
    await adminAuth.getUser(user.uid);
  } catch {
    await adminAuth.createUser({ uid: user.uid, email: user.email, password: PASSWORD });
  }
  await adminAuth.setCustomUserClaims(user.uid, { role: user.role });
  await adminDb
    .collection('users')
    .doc(user.uid)
    .set(
      profileDoc({
        email: user.email,
        role: user.role,
        active,
        firstName: user.uid,
        lastName: 'Test',
      }),
    );
}

async function resetSlots(): Promise<void> {
  const existing = await adminDb.collection('scheduleSlots').get();
  await Promise.all(existing.docs.map((d) => adminDb.recursiveDelete(d.ref)));
  await Promise.all(
    Object.values(users).map((u) =>
      adminDb
        .collection('users')
        .doc(u.uid)
        .collection('bookings')
        .get()
        .then((snap) => Promise.all(snap.docs.map((d) => d.ref.delete()))),
    ),
  );
  await adminDb
    .collection('scheduleSlots')
    .doc('open')
    .set(slotDoc({ capacity: 2 }));
  await adminDb
    .collection('scheduleSlots')
    .doc('last-place')
    .set(slotDoc({ capacity: 1 }));
  await adminDb
    .collection('scheduleSlots')
    .doc('disabled')
    .set(slotDoc({ enabled: false }));
  await adminDb
    .collection('scheduleSlots')
    .doc('past')
    .set(slotDoc({ startsAt: PAST }));
}

let admin: Client;
let alice: Client;
let bob: Client;
let inactive: Client;

beforeAll(async () => {
  await Promise.all([
    ensureUser(users.admin),
    ensureUser(users.alice),
    ensureUser(users.bob),
    ensureUser(users.inactive, false),
  ]);
  admin = new Client('admin');
  alice = new Client('alice');
  bob = new Client('bob');
  inactive = new Client('inactive');
  await Promise.all([
    admin.signIn(users.admin),
    alice.signIn(users.alice),
    bob.signIn(users.bob),
    inactive.signIn(users.inactive),
  ]);
});

afterAll(async () => {
  await Promise.all([admin, alice, bob, inactive].map((c) => c.dispose()));
});

beforeEach(async () => {
  await resetSlots();
});

async function bookedCount(slotId: string): Promise<number> {
  return (await adminDb.collection('scheduleSlots').doc(slotId).get()).get('bookedCount');
}

describe('createBooking', () => {
  it('books a slot, increments the counter and mirrors the booking to the student', async () => {
    const result = await alice.call<{ slotId: string }, { remaining: number }>('createBooking', {
      slotId: 'open',
    });
    expect(result.remaining).toBe(1);
    expect(await bookedCount('open')).toBe(1);
    const mirror = await adminDb
      .collection('users')
      .doc(users.alice.uid)
      .collection('bookings')
      .doc('open')
      .get();
    expect(mirror.get('status')).toBe('confirmed');
    expect(mirror.get('userName')).toBe('fn-alice Test');
  });

  it('rejects duplicate bookings', async () => {
    await alice.call('createBooking', { slotId: 'open' });
    expect(await codeOf(alice.call('createBooking', { slotId: 'open' }))).toBe(
      'failed-precondition',
    );
    expect(await bookedCount('open')).toBe(1);
  });

  it('rejects disabled, past and unknown slots', async () => {
    expect(await codeOf(alice.call('createBooking', { slotId: 'disabled' }))).toBe(
      'failed-precondition',
    );
    expect(await codeOf(alice.call('createBooking', { slotId: 'past' }))).toBe(
      'failed-precondition',
    );
    expect(await codeOf(alice.call('createBooking', { slotId: 'nope' }))).toBe('not-found');
    expect(await codeOf(alice.call('createBooking', { slotId: '' }))).toBe('invalid-argument');
  });

  it('only one of two concurrent students gets the last place', async () => {
    const results = await Promise.all([
      codeOf(alice.call('createBooking', { slotId: 'last-place' })),
      codeOf(bob.call('createBooking', { slotId: 'last-place' })),
    ]);
    expect(results.filter((r) => r === 'ok')).toHaveLength(1);
    expect(results.filter((r) => r === 'resource-exhausted')).toHaveLength(1);
    expect(await bookedCount('last-place')).toBe(1);
  });

  it('rejects admins, inactive students and anonymous callers', async () => {
    expect(await codeOf(admin.call('createBooking', { slotId: 'open' }))).toBe('permission-denied');
    expect(await codeOf(inactive.call('createBooking', { slotId: 'open' }))).toBe(
      'permission-denied',
    );
    const anon = new Client('anon');
    expect(await codeOf(anon.call('createBooking', { slotId: 'open' }))).toBe('unauthenticated');
    await anon.dispose();
  });
});

describe('cancelBooking', () => {
  it('releases the place and lets the student book again', async () => {
    await alice.call('createBooking', { slotId: 'last-place' });
    await alice.call('cancelBooking', { slotId: 'last-place' });
    expect(await bookedCount('last-place')).toBe(0);
    const mirror = await adminDb
      .collection('users')
      .doc(users.alice.uid)
      .collection('bookings')
      .doc('last-place')
      .get();
    expect(mirror.get('status')).toBe('cancelled');

    await bob.call('createBooking', { slotId: 'last-place' });
    expect(await bookedCount('last-place')).toBe(1);
  });

  it('rejects cancelling without a booking or after the slot started', async () => {
    expect(await codeOf(alice.call('cancelBooking', { slotId: 'open' }))).toBe(
      'failed-precondition',
    );
    await adminDb
      .collection('scheduleSlots')
      .doc('past')
      .collection('bookings')
      .doc(users.alice.uid)
      .set({ status: 'confirmed' });
    expect(await codeOf(alice.call('cancelBooking', { slotId: 'past' }))).toBe(
      'failed-precondition',
    );
  });
});

describe('createStudent / setUserActive / setUserRole', () => {
  const email = `created-${Date.now()}@gym.local`;

  it('lets an admin create a student with claims, profile and a setup link', async () => {
    const result = await admin.call<
      Record<string, unknown>,
      { uid: string; passwordSetupLink: string }
    >('createStudent', {
      email,
      firstName: 'Nueva',
      lastName: 'Alumna',
      features: { nutritionEnabled: true },
    });
    expect(result.uid).toBeTruthy();
    expect(result.passwordSetupLink).toContain('oobCode');
    const authUser = await adminAuth.getUser(result.uid);
    expect(authUser.customClaims).toEqual({ role: 'STUDENT' });
    const profile = await adminDb.collection('users').doc(result.uid).get();
    expect(profile.get('role')).toBe('STUDENT');
    expect(profile.get('features')).toEqual({ nutritionEnabled: true, recipesEnabled: false });

    expect(
      await codeOf(admin.call('createStudent', { email, firstName: 'Dup', lastName: 'X' })),
    ).toBe('already-exists');
    expect(
      await codeOf(admin.call('createStudent', { email: 'bad', firstName: 'X', lastName: 'Y' })),
    ).toBe('invalid-argument');
  });

  it('rejects students trying to create accounts', async () => {
    expect(
      await codeOf(
        alice.call('createStudent', { email: 'x@gym.local', firstName: 'X', lastName: 'Y' }),
      ),
    ).toBe('permission-denied');
  });

  it('prevents an admin from disabling themselves or changing their own role', async () => {
    expect(
      await codeOf(admin.call('setUserActive', { userId: users.admin.uid, active: false })),
    ).toBe('failed-precondition');
    expect(
      await codeOf(admin.call('setUserRole', { userId: users.admin.uid, role: 'STUDENT' })),
    ).toBe('failed-precondition');
    expect(
      await codeOf(alice.call('setUserRole', { userId: users.alice.uid, role: 'ADMIN' })),
    ).toBe('permission-denied');
  });

  it('disables and re-enables a student (Auth + profile)', async () => {
    await admin.call('setUserActive', { userId: users.bob.uid, active: false });
    expect((await adminAuth.getUser(users.bob.uid)).disabled).toBe(true);
    expect((await adminDb.collection('users').doc(users.bob.uid).get()).get('active')).toBe(false);
    await admin.call('setUserActive', { userId: users.bob.uid, active: true });
    expect((await adminAuth.getUser(users.bob.uid)).disabled).toBe(false);
  });
});
