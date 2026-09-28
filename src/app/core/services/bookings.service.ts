import { inject, Injectable } from '@angular/core';
import { collection, orderBy, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { Observable } from 'rxjs';
import { collectionData$, converterFor, num, oneOf, str } from '@core/firebase/firestore.utils';
import { FIREBASE_FUNCTIONS, FIRESTORE } from '@core/firebase/firebase.tokens';
import { Booking } from '@shared/models/schedule';
import { SCHEDULE_SLOTS_COLLECTION } from './schedule.service';
import { USERS_COLLECTION } from './users.service';

export const BOOKINGS_COLLECTION = 'bookings';

export function toBooking(id: string, data: Record<string, unknown>): Booking & { id: string } {
  return {
    id,
    slotId: str(data, 'slotId'),
    userId: str(data, 'userId'),
    userName: str(data, 'userName'),
    date: str(data, 'date'),
    startTime: str(data, 'startTime'),
    startsAt: num(data, 'startsAt'),
    status: oneOf(data, 'status', ['confirmed', 'cancelled'] as const, 'cancelled'),
  };
}

const bookingConverter = converterFor(toBooking);

/**
 * Bookings are created and cancelled exclusively through Cloud Functions (transactional
 * capacity checks). This service only reads the resulting documents.
 */
@Injectable({ providedIn: 'root' })
export class BookingsService {
  private readonly firestore = inject(FIRESTORE);
  private readonly functions = inject(FIREBASE_FUNCTIONS);

  private readonly createBookingFn = httpsCallable<{ slotId: string }, { remaining: number }>(
    this.functions,
    'createBooking',
  );
  private readonly cancelBookingFn = httpsCallable<{ slotId: string }, { slotId: string }>(
    this.functions,
    'cancelBooking',
  );

  /** Every booking of a student (confirmed and cancelled), newest first. */
  myBookings$(userId: string): Observable<Booking[]> {
    return collectionData$(
      query(
        collection(this.firestore, USERS_COLLECTION, userId, BOOKINGS_COLLECTION).withConverter(
          bookingConverter,
        ),
        orderBy('startsAt', 'desc'),
      ),
    );
  }

  /** Confirmed bookings of a slot (admin view). */
  slotBookings$(slotId: string): Observable<Booking[]> {
    return collectionData$(
      query(
        collection(
          this.firestore,
          SCHEDULE_SLOTS_COLLECTION,
          slotId,
          BOOKINGS_COLLECTION,
        ).withConverter(bookingConverter),
        where('status', '==', 'confirmed'),
        orderBy('userName'),
      ),
    );
  }

  async book(slotId: string): Promise<number> {
    const result = await this.createBookingFn({ slotId });
    return result.data.remaining;
  }

  async cancel(slotId: string): Promise<void> {
    await this.cancelBookingFn({ slotId });
  }
}
