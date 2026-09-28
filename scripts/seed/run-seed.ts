import { initializeApp } from 'firebase-admin/app';
import { getAuth, UserRecord } from 'firebase-admin/auth';
import { FieldValue, Firestore, getFirestore } from 'firebase-admin/firestore';
import {
  measurementsFor,
  SEED_NUTRITION_PLAN,
  SEED_OLD_TRAINING_PLAN,
  SEED_RECIPES,
  SEED_SCHEDULE,
  SEED_TRAINING_PLAN,
} from './seed-content';
import {
  DEMO_PASSWORD,
  SEED_GYM_SETTINGS,
  SEED_MEMBERSHIP_PLANS,
  SEED_USERS,
  SeedUser,
} from './seed-data';

const now = () => FieldValue.serverTimestamp();

export async function runSeed(projectId: string): Promise<void> {
  const app = initializeApp({ projectId });
  const auth = getAuth(app);
  const db = getFirestore(app);
  const today = new Date();

  console.log(`Seeding emulators for project "${projectId}"…\n`);

  const uids = new Map<string, string>();
  for (const user of SEED_USERS) {
    const record = await upsertAuthUser(auth, user);
    uids.set(user.email, record.uid);
    await auth.setCustomUserClaims(record.uid, { role: user.role });
    await db
      .collection('users')
      .doc(record.uid)
      .set(
        {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone ?? '',
          birthDate: '',
          role: user.role,
          active: true,
          joinDate: isoDate(new Date(today.getFullYear(), today.getMonth() - 6, 1)),
          notes: '',
          features: user.features,
          activeTrainingPlanId: null,
          activeNutritionPlanId: null,
          createdAt: now(),
          updatedAt: now(),
        },
        { merge: true },
      );
    console.log(`  ✔ ${user.role.padEnd(7)} ${user.email}`);
  }

  await db
    .collection('gymSettings')
    .doc('public')
    .set({ ...SEED_GYM_SETTINGS, updatedAt: now() }, { merge: true });
  console.log('  ✔ gymSettings/public');

  for (const plan of SEED_MEMBERSHIP_PLANS) {
    const { id, ...data } = plan;
    await db
      .collection('membershipPlans')
      .doc(id)
      .set({ ...data, updatedAt: now() }, { merge: true });
  }
  console.log(`  ✔ ${SEED_MEMBERSHIP_PLANS.length} membership plans`);

  const student1 = uids.get('student1@gym.local')!;
  const student2 = uids.get('student2@gym.local')!;

  await seedMeasurements(
    db,
    student1,
    measurementsFor({ weight: 98.1, fat: 27, muscle: 34, waist: 96 }, 6, today),
  );
  await seedMeasurements(
    db,
    student2,
    measurementsFor({ weight: 71.4, fat: 22, muscle: 29, waist: 80 }, 2, today),
  );
  console.log('  ✔ measurements');

  await seedTrainingPlans(db, student1, today);
  await seedNutritionPlan(db, student1, today);
  console.log('  ✔ training & nutrition plans');

  for (const recipe of SEED_RECIPES) {
    const { id, ...data } = recipe;
    await db
      .collection('recipes')
      .doc(id)
      .set({ ...data, imageUrl: '', imagePath: '', updatedAt: now() }, { merge: true });
  }
  console.log(`  ✔ ${SEED_RECIPES.length} recipes`);

  const slotIds = await seedSchedule(db, today);
  await seedBookings(db, slotIds, { id: student1, name: 'Valentina Pérez' }, today);
  console.log(`  ✔ ${slotIds.length} schedule slots + demo bookings`);

  console.log(`\nDone. Demo password for every user (LOCAL ONLY): ${DEMO_PASSWORD}`);
}

async function upsertAuthUser(
  auth: ReturnType<typeof getAuth>,
  user: SeedUser,
): Promise<UserRecord> {
  const displayName = `${user.firstName} ${user.lastName}`;
  try {
    const existing = await auth.getUserByEmail(user.email);
    return auth.updateUser(existing.uid, { displayName, password: DEMO_PASSWORD, disabled: false });
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

async function seedMeasurements(
  db: Firestore,
  userId: string,
  measurements: ReturnType<typeof measurementsFor>,
): Promise<void> {
  const collection = db.collection('users').doc(userId).collection('measurements');
  const existing = await collection.get();
  await Promise.all(existing.docs.map((doc) => doc.ref.delete()));
  for (const m of measurements) {
    await collection.add({
      ...m,
      height: 176,
      chest: null,
      hip: null,
      arm: null,
      thigh: null,
      createdAt: now(),
    });
  }
}

async function seedTrainingPlans(db: Firestore, userId: string, today: Date): Promise<void> {
  const collection = db.collection('users').doc(userId).collection('trainingPlans');
  await collection.doc('bloque-1').set(
    {
      ...SEED_TRAINING_PLAN,
      startDate: isoDate(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
      endDate: '',
      updatedAt: now(),
    },
    { merge: true },
  );
  await collection.doc('adaptacion').set(
    {
      ...SEED_OLD_TRAINING_PLAN,
      startDate: isoDate(new Date(today.getFullYear(), today.getMonth() - 3, 1)),
      endDate: isoDate(new Date(today.getFullYear(), today.getMonth() - 1, 0)),
      updatedAt: now(),
    },
    { merge: true },
  );
  await db.collection('users').doc(userId).update({ activeTrainingPlanId: 'bloque-1' });
}

async function seedNutritionPlan(db: Firestore, userId: string, today: Date): Promise<void> {
  await db
    .collection('users')
    .doc(userId)
    .collection('nutritionPlans')
    .doc('recomposicion')
    .set(
      {
        ...SEED_NUTRITION_PLAN,
        startDate: isoDate(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
        endDate: '',
        updatedAt: now(),
      },
      { merge: true },
    );
  await db.collection('users').doc(userId).update({ activeNutritionPlanId: 'recomposicion' });
}

/** Re-runnable: existing slots keep their `bookedCount`, only new ones start at zero. */
async function seedSchedule(db: Firestore, today: Date): Promise<string[]> {
  const ids: string[] = [];
  const existingIds = new Set(
    (await db.collection('scheduleSlots').select().get()).docs.map((doc) => doc.id),
  );
  const batch = db.batch();
  for (let offset = 0; offset < SEED_SCHEDULE.daysAhead; offset += 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    if (!SEED_SCHEDULE.weekdays.includes(date.getDay())) {
      continue;
    }
    const times =
      offset === 1 ? [SEED_SCHEDULE.tinySlotTime, ...SEED_SCHEDULE.times] : SEED_SCHEDULE.times;
    for (const time of times) {
      const iso = isoDate(date);
      const id = `${iso}_${time.replace(':', '')}`;
      const [hours, minutes] = time.split(':').map(Number);
      const startsAt = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hours,
        minutes,
      ).getTime();
      ids.push(id);
      batch.set(
        db.collection('scheduleSlots').doc(id),
        {
          date: iso,
          startTime: time,
          durationMinutes: SEED_SCHEDULE.durationMinutes,
          startsAt,
          capacity: time === SEED_SCHEDULE.tinySlotTime ? 1 : SEED_SCHEDULE.capacity,
          enabled: true,
          updatedAt: now(),
          ...(existingIds.has(id) ? {} : { bookedCount: 0, createdAt: now() }),
        },
        { merge: true },
      );
    }
  }
  await batch.commit();
  return ids;
}

/** Books the first upcoming morning slot for the given student, mirroring the function's writes. */
async function seedBookings(
  db: Firestore,
  slotIds: readonly string[],
  student: { id: string; name: string },
  today: Date,
): Promise<void> {
  const tomorrow = isoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));
  const slotId = slotIds.find((id) => id.startsWith(tomorrow) && id.endsWith('_0800'));
  if (!slotId) {
    return;
  }
  const slotRef = db.collection('scheduleSlots').doc(slotId);
  const slot = (await slotRef.get()).data();
  if (!slot) {
    return;
  }
  const booking = {
    slotId,
    userId: student.id,
    userName: student.name,
    date: slot['date'],
    startTime: slot['startTime'],
    startsAt: slot['startsAt'],
    status: 'confirmed',
    createdAt: now(),
    cancelledAt: null,
  };
  const bookingRef = slotRef.collection('bookings').doc(student.id);
  const alreadyBooked = (await bookingRef.get()).exists;
  await bookingRef.set(booking);
  await db.collection('users').doc(student.id).collection('bookings').doc(slotId).set(booking);
  if (!alreadyBooked) {
    await slotRef.update({ bookedCount: FieldValue.increment(1) });
  }
}

function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isUserNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 'auth/user-not-found'
  );
}
