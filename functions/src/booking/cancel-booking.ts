import { FieldValue } from 'firebase-admin/firestore';
import { onCall } from 'firebase-functions/v2/https';
import { requireRole } from '../shared/auth';
import { adminDb, COLLECTIONS } from '../shared/firebase-admin';
import { asRecord, requireString } from '../shared/validation';
import { assertBookingCancellable, toSlotState } from './booking-rules';

/**
 * Cancels the caller's booking for a slot and releases the place, in one transaction so the
 * counter can never drift from the actual confirmed bookings.
 */
export const cancelBooking = onCall<unknown, Promise<{ slotId: string }>>(async (request) => {
  const caller = requireRole(request, 'STUDENT');
  const slotId = requireString(asRecord(request.data), 'slotId', 'El horario', 128);
  const db = adminDb();

  const slotRef = db.collection(COLLECTIONS.scheduleSlots).doc(slotId);
  const bookingRef = slotRef.collection(COLLECTIONS.bookings).doc(caller.uid);
  const mirrorRef = db
    .collection(COLLECTIONS.users)
    .doc(caller.uid)
    .collection(COLLECTIONS.bookings)
    .doc(slotId);

  await db.runTransaction(async (tx) => {
    const [slotSnap, bookingSnap] = await Promise.all([tx.get(slotRef), tx.get(bookingRef)]);
    const slot = toSlotState(slotSnap.data());
    const confirmed = bookingSnap.exists && bookingSnap.get('status') === 'confirmed';
    assertBookingCancellable(slot, confirmed, Date.now());

    const patch = { status: 'cancelled', cancelledAt: FieldValue.serverTimestamp() };
    tx.update(bookingRef, patch);
    tx.set(mirrorRef, patch, { merge: true });
    tx.update(slotRef, {
      bookedCount: Math.max(0, slot.bookedCount - 1),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  return { slotId };
});
