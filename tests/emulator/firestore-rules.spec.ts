import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { assertFails, assertSucceeds, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { ADMIN_TOKEN, createRulesEnvironment, profileDoc, slotDoc, STUDENT_TOKEN } from './helpers';

const ALICE = 'alice';
const BOB = 'bob';
const ADMIN = 'admin-1';

let env: RulesTestEnvironment;

const asAdmin = () => env.authenticatedContext(ADMIN, ADMIN_TOKEN).firestore();
const asAlice = () => env.authenticatedContext(ALICE, STUDENT_TOKEN).firestore();
const asBob = () => env.authenticatedContext(BOB, STUDENT_TOKEN).firestore();
const asAnon = () => env.unauthenticatedContext().firestore();

beforeAll(async () => {
  env = await createRulesEnvironment();
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  // Seed with rules disabled, as the Admin SDK / Cloud Functions would.
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users', ALICE), profileDoc({ email: 'alice@gym.local' }));
    await setDoc(
      doc(db, 'users', BOB),
      profileDoc({
        email: 'bob@gym.local',
        features: { nutritionEnabled: true, recipesEnabled: true },
      }),
    );
    await setDoc(doc(db, 'users', ADMIN), profileDoc({ email: 'admin@gym.local', role: 'ADMIN' }));
    await setDoc(doc(db, 'users', ALICE, 'measurements', 'm1'), { date: '2026-01-01', weight: 80 });
    await setDoc(doc(db, 'users', ALICE, 'nutritionPlans', 'n1'), { title: 'Plan', active: true });
    await setDoc(doc(db, 'users', BOB, 'nutritionPlans', 'n1'), { title: 'Plan', active: true });
    await setDoc(doc(db, 'users', ALICE, 'trainingPlans', 't1'), { name: 'Plan', active: true });
    await setDoc(doc(db, 'users', ALICE, 'bookings', 's1'), { slotId: 's1', status: 'confirmed' });
    await setDoc(doc(db, 'membershipPlans', 'active'), {
      name: 'A',
      price: 1,
      active: true,
      displayOrder: 1,
    });
    await setDoc(doc(db, 'membershipPlans', 'inactive'), {
      name: 'B',
      price: 1,
      active: false,
      displayOrder: 2,
    });
    await setDoc(doc(db, 'gymSettings', 'public'), { gymName: 'Gym' });
    await setDoc(doc(db, 'gymSettings', 'private'), { secret: true });
    await setDoc(doc(db, 'scheduleSlots', 's1'), slotDoc());
    await setDoc(doc(db, 'scheduleSlots', 's1', 'bookings', ALICE), {
      userId: ALICE,
      status: 'confirmed',
    });
    await setDoc(doc(db, 'recipes', 'r-active'), { title: 'Activa', active: true });
    await setDoc(doc(db, 'recipes', 'r-archived'), { title: 'Archivada', active: false });
  });
});

describe('public content', () => {
  it('anonymous users read active membership plans and public settings only', async () => {
    await assertSucceeds(getDoc(doc(asAnon(), 'membershipPlans', 'active')));
    await assertFails(getDoc(doc(asAnon(), 'membershipPlans', 'inactive')));
    await assertSucceeds(
      getDocs(query(collection(asAnon(), 'membershipPlans'), where('active', '==', true))),
    );
    await assertSucceeds(getDoc(doc(asAnon(), 'gymSettings', 'public')));
    await assertFails(getDoc(doc(asAnon(), 'gymSettings', 'private')));
    await assertFails(getDoc(doc(asAnon(), 'users', ALICE)));
  });

  it('only admins write plans and settings', async () => {
    await assertFails(
      setDoc(doc(asAlice(), 'membershipPlans', 'x'), {
        name: 'X',
        price: 1,
        active: true,
        displayOrder: 1,
      }),
    );
    await assertSucceeds(
      setDoc(doc(asAdmin(), 'membershipPlans', 'x'), {
        name: 'X',
        price: 1,
        active: true,
        displayOrder: 1,
      }),
    );
    await assertFails(setDoc(doc(asAdmin(), 'membershipPlans', 'bad'), { name: 'X' }));
    await assertFails(setDoc(doc(asAlice(), 'gymSettings', 'public'), { gymName: 'Hack' }));
    await assertSucceeds(setDoc(doc(asAdmin(), 'gymSettings', 'public'), { gymName: 'Ok' }));
  });
});

describe('user profiles', () => {
  it('a student reads only their own profile', async () => {
    await assertSucceeds(getDoc(doc(asAlice(), 'users', ALICE)));
    await assertFails(getDoc(doc(asAlice(), 'users', BOB)));
    await assertSucceeds(getDoc(doc(asAdmin(), 'users', BOB)));
  });

  it('nobody creates or deletes profiles from the client', async () => {
    await assertFails(setDoc(doc(asAdmin(), 'users', 'new'), profileDoc()));
    await assertFails(setDoc(doc(asAlice(), 'users', 'new'), profileDoc()));
    await assertFails(deleteDoc(doc(asAdmin(), 'users', ALICE)));
  });

  it('a student cannot promote themselves or enable features', async () => {
    await assertFails(updateDoc(doc(asAlice(), 'users', ALICE), { role: 'ADMIN' }));
    await assertFails(
      updateDoc(doc(asAlice(), 'users', ALICE), { 'features.nutritionEnabled': true }),
    );
    await assertFails(updateDoc(doc(asAlice(), 'users', ALICE), { active: false }));
    await assertFails(updateDoc(doc(asAlice(), 'users', ALICE), { phone: '1', firstName: 'X' }));
    await assertSucceeds(updateDoc(doc(asAlice(), 'users', ALICE), { phone: '099', updatedAt: 1 }));
  });

  it('an admin edits profile data but never role, email or active flag', async () => {
    await assertSucceeds(
      updateDoc(doc(asAdmin(), 'users', ALICE), {
        firstName: 'Alicia',
        'features.recipesEnabled': true,
      }),
    );
    await assertFails(updateDoc(doc(asAdmin(), 'users', ALICE), { role: 'ADMIN' }));
    await assertFails(updateDoc(doc(asAdmin(), 'users', ALICE), { email: 'other@gym.local' }));
    await assertFails(updateDoc(doc(asAdmin(), 'users', ALICE), { active: false }));
  });
});

describe('private subcollections', () => {
  it('measurements: owner/admin read, admin appends, nobody updates', async () => {
    await assertSucceeds(getDoc(doc(asAlice(), 'users', ALICE, 'measurements', 'm1')));
    await assertFails(getDoc(doc(asBob(), 'users', ALICE, 'measurements', 'm1')));
    await assertSucceeds(
      addDoc(collection(asAdmin(), 'users', ALICE, 'measurements'), {
        date: '2026-02-01',
        weight: 79,
      }),
    );
    await assertFails(
      addDoc(collection(asAlice(), 'users', ALICE, 'measurements'), {
        date: '2026-02-01',
        weight: 1,
      }),
    );
    await assertFails(
      updateDoc(doc(asAdmin(), 'users', ALICE, 'measurements', 'm1'), { weight: 1 }),
    );
    await assertSucceeds(deleteDoc(doc(asAdmin(), 'users', ALICE, 'measurements', 'm1')));
  });

  it('training plans: owner reads, admin writes', async () => {
    await assertSucceeds(getDoc(doc(asAlice(), 'users', ALICE, 'trainingPlans', 't1')));
    await assertFails(getDoc(doc(asBob(), 'users', ALICE, 'trainingPlans', 't1')));
    await assertFails(
      setDoc(doc(asAlice(), 'users', ALICE, 'trainingPlans', 't2'), { name: 'Mine' }),
    );
    await assertSucceeds(
      setDoc(doc(asAdmin(), 'users', ALICE, 'trainingPlans', 't2'), { name: 'Ok' }),
    );
  });

  it('nutrition plans require the feature flag on the owner profile', async () => {
    await assertFails(getDoc(doc(asAlice(), 'users', ALICE, 'nutritionPlans', 'n1')));
    await assertSucceeds(getDoc(doc(asBob(), 'users', BOB, 'nutritionPlans', 'n1')));
    await assertFails(getDoc(doc(asBob(), 'users', ALICE, 'nutritionPlans', 'n1')));
    await assertSucceeds(getDoc(doc(asAdmin(), 'users', ALICE, 'nutritionPlans', 'n1')));
  });

  it('booking mirrors are read-only for everyone', async () => {
    await assertSucceeds(getDoc(doc(asAlice(), 'users', ALICE, 'bookings', 's1')));
    await assertFails(getDoc(doc(asBob(), 'users', ALICE, 'bookings', 's1')));
    await assertFails(
      setDoc(doc(asAlice(), 'users', ALICE, 'bookings', 's2'), { status: 'confirmed' }),
    );
    await assertFails(
      setDoc(doc(asAdmin(), 'users', ALICE, 'bookings', 's2'), { status: 'confirmed' }),
    );
  });
});

describe('schedule', () => {
  it('signed-in users read slots, anonymous users do not', async () => {
    await assertSucceeds(getDoc(doc(asAlice(), 'scheduleSlots', 's1')));
    await assertFails(getDoc(doc(asAnon(), 'scheduleSlots', 's1')));
  });

  it('admins manage slots but never touch the booking counter', async () => {
    await assertSucceeds(setDoc(doc(asAdmin(), 'scheduleSlots', 's2'), slotDoc()));
    await assertFails(setDoc(doc(asAdmin(), 'scheduleSlots', 's3'), slotDoc({ bookedCount: 3 })));
    await assertFails(setDoc(doc(asAdmin(), 'scheduleSlots', 's4'), slotDoc({ capacity: 0 })));
    await assertSucceeds(
      updateDoc(doc(asAdmin(), 'scheduleSlots', 's1'), { capacity: 5, enabled: false }),
    );
    await assertFails(updateDoc(doc(asAdmin(), 'scheduleSlots', 's1'), { bookedCount: 5 }));
    await assertFails(setDoc(doc(asAlice(), 'scheduleSlots', 's5'), slotDoc()));
  });

  it('slots with bookings cannot be deleted', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore(), 'scheduleSlots', 's1'), { bookedCount: 1 });
    });
    await assertFails(deleteDoc(doc(asAdmin(), 'scheduleSlots', 's1')));
    await assertSucceeds(setDoc(doc(asAdmin(), 'scheduleSlots', 'empty'), slotDoc()));
    await assertSucceeds(deleteDoc(doc(asAdmin(), 'scheduleSlots', 'empty')));
  });

  it('bookings under a slot are written only by Cloud Functions', async () => {
    await assertSucceeds(getDoc(doc(asAlice(), 'scheduleSlots', 's1', 'bookings', ALICE)));
    await assertFails(getDoc(doc(asBob(), 'scheduleSlots', 's1', 'bookings', ALICE)));
    await assertSucceeds(getDoc(doc(asAdmin(), 'scheduleSlots', 's1', 'bookings', ALICE)));
    await assertFails(
      setDoc(doc(asBob(), 'scheduleSlots', 's1', 'bookings', BOB), { status: 'confirmed' }),
    );
    await assertFails(
      setDoc(doc(asAdmin(), 'scheduleSlots', 's1', 'bookings', BOB), { status: 'confirmed' }),
    );
  });
});

describe('recipes', () => {
  it('students need the feature flag and only see active recipes', async () => {
    await assertFails(getDoc(doc(asAlice(), 'recipes', 'r-active')));
    await assertSucceeds(getDoc(doc(asBob(), 'recipes', 'r-active')));
    await assertFails(getDoc(doc(asBob(), 'recipes', 'r-archived')));
    await assertSucceeds(
      getDocs(query(collection(asBob(), 'recipes'), where('active', '==', true))),
    );
    await assertFails(getDocs(collection(asBob(), 'recipes')));
    await assertSucceeds(getDoc(doc(asAdmin(), 'recipes', 'r-archived')));
    await assertFails(getDoc(doc(asAnon(), 'recipes', 'r-active')));
  });

  it('only admins write recipes', async () => {
    await assertFails(setDoc(doc(asBob(), 'recipes', 'new'), { title: 'x', active: true }));
    await assertSucceeds(setDoc(doc(asAdmin(), 'recipes', 'new'), { title: 'x', active: true }));
  });
});
