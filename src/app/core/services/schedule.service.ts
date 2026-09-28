import { inject, Injectable } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { bool, collectionData$, converterFor, num, str } from '@core/firebase/firestore.utils';
import { FIRESTORE } from '@core/firebase/firebase.tokens';
import { ScheduleSlot, SlotInput } from '@shared/models/schedule';
import { dateRange, toEpoch, weekdayOf } from '@shared/utilities/dates';

export const SCHEDULE_SLOTS_COLLECTION = 'scheduleSlots';
const MAX_GENERATED_SLOTS = 450;

export function toScheduleSlot(id: string, data: Record<string, unknown>): ScheduleSlot {
  return {
    id,
    date: str(data, 'date'),
    startTime: str(data, 'startTime'),
    durationMinutes: num(data, 'durationMinutes', 60),
    startsAt: num(data, 'startsAt'),
    capacity: num(data, 'capacity'),
    bookedCount: num(data, 'bookedCount'),
    enabled: bool(data, 'enabled'),
  };
}

const slotConverter = converterFor(toScheduleSlot);

/** Deterministic id so generating the same day/time twice cannot create duplicates. */
export function slotIdFor(date: string, startTime: string): string {
  return `${date}_${startTime.replace(':', '')}`;
}

export interface SlotGenerationInput {
  readonly fromDate: string;
  readonly toDate: string;
  /** `Date.getDay()` values (0 = Sunday). */
  readonly weekdays: readonly number[];
  readonly times: readonly string[];
  readonly capacity: number;
  readonly durationMinutes: number;
}

export interface SlotGenerationResult {
  readonly created: number;
  readonly updated: number;
}

/** Slot administration and availability queries. `bookedCount` is never written from here. */
@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly firestore = inject(FIRESTORE);

  private get collectionRef() {
    return collection(this.firestore, SCHEDULE_SLOTS_COLLECTION);
  }

  private rangeQuery(fromDate: string, toDate: string) {
    return query(
      this.collectionRef.withConverter(slotConverter),
      where('date', '>=', fromDate),
      where('date', '<=', toDate),
      orderBy('date'),
      orderBy('startsAt'),
    );
  }

  /** Slots between two ISO dates (inclusive), ordered by start. */
  slotsBetween$(fromDate: string, toDate: string): Observable<ScheduleSlot[]> {
    return collectionData$(this.rangeQuery(fromDate, toDate));
  }

  slotsForDate$(date: string): Observable<ScheduleSlot[]> {
    return this.slotsBetween$(date, date);
  }

  /**
   * Bulk-creates slots for the selected weekdays/times in a date range. Existing slots keep
   * their bookings and enabled state; only capacity and duration are refreshed.
   */
  async generate(input: SlotGenerationInput): Promise<SlotGenerationResult> {
    const targets = dateRange(input.fromDate, input.toDate)
      .filter((date) => input.weekdays.includes(weekdayOf(date)))
      .flatMap((date) => input.times.map((time) => ({ date, time, id: slotIdFor(date, time) })));
    if (targets.length === 0) {
      return { created: 0, updated: 0 };
    }
    if (targets.length > MAX_GENERATED_SLOTS) {
      throw new Error(
        `Demasiados horarios en una sola generación (máximo ${MAX_GENERATED_SLOTS}).`,
      );
    }

    const existing = new Set(
      (await getDocs(this.rangeQuery(input.fromDate, input.toDate))).docs.map((d) => d.id),
    );
    const batch = writeBatch(this.firestore);
    let created = 0;
    let updated = 0;
    for (const target of targets) {
      const ref = doc(this.collectionRef, target.id);
      if (existing.has(target.id)) {
        batch.update(ref, {
          capacity: input.capacity,
          durationMinutes: input.durationMinutes,
          updatedAt: serverTimestamp(),
        });
        updated += 1;
      } else {
        batch.set(ref, {
          date: target.date,
          startTime: target.time,
          durationMinutes: input.durationMinutes,
          startsAt: toEpoch(target.date, target.time),
          capacity: input.capacity,
          bookedCount: 0,
          enabled: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        created += 1;
      }
    }
    await batch.commit();
    return { created, updated };
  }

  async create(input: SlotInput): Promise<void> {
    await setDoc(doc(this.collectionRef, slotIdFor(input.date, input.startTime)), {
      ...input,
      startsAt: toEpoch(input.date, input.startTime),
      bookedCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async update(
    slotId: string,
    changes: Partial<Pick<ScheduleSlot, 'capacity' | 'enabled' | 'durationMinutes'>>,
  ): Promise<void> {
    await updateDoc(doc(this.collectionRef, slotId), { ...changes, updatedAt: serverTimestamp() });
  }

  async remove(slotId: string): Promise<void> {
    await deleteDoc(doc(this.collectionRef, slotId));
  }
}
