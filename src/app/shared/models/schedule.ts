/**
 * Document shape of `scheduleSlots/{slotId}`. A slot is a concrete date + start time with a
 * capacity. `bookedCount` is maintained exclusively by the booking Cloud Functions inside a
 * transaction; clients never write it.
 */
export interface ScheduleSlot {
  readonly id: string;
  /** ISO date `YYYY-MM-DD`. */
  readonly date: string;
  /** `HH:mm` (24h). */
  readonly startTime: string;
  /** Minutes. */
  readonly durationMinutes: number;
  /** Absolute start instant (epoch millis) used for "in the past" checks and ordering. */
  readonly startsAt: number;
  readonly capacity: number;
  readonly bookedCount: number;
  readonly enabled: boolean;
}

export type SlotInput = Omit<ScheduleSlot, 'id' | 'bookedCount' | 'startsAt'>;

export type BookingStatus = 'confirmed' | 'cancelled';

/**
 * Booking record. Lives under `scheduleSlots/{slotId}/bookings/{uid}` (admin view, one per
 * student per slot by construction) and is mirrored to `users/{uid}/bookings/{slotId}`
 * (student view, protected by ownership rules).
 */
export interface Booking {
  readonly slotId: string;
  readonly userId: string;
  readonly userName: string;
  readonly date: string;
  readonly startTime: string;
  readonly startsAt: number;
  readonly status: BookingStatus;
}

export function remainingCapacity(slot: Pick<ScheduleSlot, 'capacity' | 'bookedCount'>): number {
  return Math.max(0, slot.capacity - slot.bookedCount);
}

export function isSlotFull(slot: Pick<ScheduleSlot, 'capacity' | 'bookedCount'>): boolean {
  return slot.bookedCount >= slot.capacity;
}

export function isSlotPast(slot: Pick<ScheduleSlot, 'startsAt'>, now = Date.now()): boolean {
  return slot.startsAt <= now;
}
