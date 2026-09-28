import { FieldValue } from 'firebase-admin/firestore';
import { onCall } from 'firebase-functions/v2/https';
import { requireRole } from '../shared/auth';
import { adminDb, COLLECTIONS } from '../shared/firebase-admin';
import { asRecord, requireString } from '../shared/validation';
import {
  assertSlotBookable,
  assertStudentCanBook,
  toSlotState,
  toStudentState,
} from './booking-rules';

export interface CreateBookingResponse {
  readonly slotId: string;
  readonly remaining: number;
}

/**
 * Books a slot for the calling student. Everything runs inside one Firestore transaction:
 * two students racing for the last place both read `bookedCount`, but only the first commit
 * succeeds; the other transaction retries, re-reads the updated count and fails with
 * `resource-exhausted`. Clients never write `bookedCount`.
 */
export const createBooking = onCall<unknown, Promise<CreateBookingResponse>>(async (request) => {
  const caller = requireRole(request, 'STUDENT');
  const slotId = requireString(asRecord(request.data), 'slotId', 'El horario', 128);
  const db = adminDb();

  const slotRef = db.collection(COLLECTIONS.scheduleSlots).doc(slotId);
  const bookingRef = slotRef.collection(COLLECTIONS.bookings).doc(caller.uid);
  const userRef = db.collection(COLLECTIONS.users).doc(caller.uid);
  const mirrorRef = userRef.collection(COLLECTIONS.bookings).doc(slotId);

  return db.runTransaction(async (tx) => {
    const [slotSnap, bookingSnap, userSnap] = await Promise.all([
      tx.get(slotRef),
      tx.get(bookingRef),
      tx.get(userRef),
    ]);

    const student = toStudentState(userSnap.data());
    assertStudentCanBook(student);

    const slot = toSlotState(slotSnap.data());
    const alreadyBooked = bookingSnap.exists && bookingSnap.get('status') === 'confirmed';
    assertSlotBookable(slot, alreadyBooked, Date.now());

    const slotData = slotSnap.data() ?? {};
    const booking = {
      slotId,
      userId: caller.uid,
      userName: `${student.firstName} ${student.lastName}`.trim(),
      date: slotData['date'] ?? '',
      startTime: slotData['startTime'] ?? '',
      startsAt: slot.startsAt,
      status: 'confirmed',
      createdAt: FieldValue.serverTimestamp(),
      cancelledAt: null,
    };

    tx.set(bookingRef, booking);
    tx.set(mirrorRef, booking);
    tx.update(slotRef, {
      bookedCount: slot.bookedCount + 1,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { slotId, remaining: slot.capacity - slot.bookedCount - 1 };
  });
});
