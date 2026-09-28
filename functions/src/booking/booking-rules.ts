import {
  exhaustedError,
  failedPreconditionError,
  forbiddenError,
  notFoundError,
} from '../shared/errors';

/** Subset of a `scheduleSlots` document the booking rules need. */
export interface SlotState {
  readonly enabled: boolean;
  readonly capacity: number;
  readonly bookedCount: number;
  readonly startsAt: number;
}

export interface StudentState {
  readonly active: boolean;
  readonly firstName: string;
  readonly lastName: string;
}

export function toSlotState(data: FirebaseFirestore.DocumentData | undefined): SlotState | null {
  if (!data) {
    return null;
  }
  return {
    enabled: data['enabled'] === true,
    capacity: typeof data['capacity'] === 'number' ? data['capacity'] : 0,
    bookedCount: typeof data['bookedCount'] === 'number' ? data['bookedCount'] : 0,
    startsAt: typeof data['startsAt'] === 'number' ? data['startsAt'] : 0,
  };
}

export function toStudentState(
  data: FirebaseFirestore.DocumentData | undefined,
): StudentState | null {
  if (!data) {
    return null;
  }
  return {
    active: data['active'] === true,
    firstName: typeof data['firstName'] === 'string' ? data['firstName'] : '',
    lastName: typeof data['lastName'] === 'string' ? data['lastName'] : '',
  };
}

/** Pure business rules, shared by both callables and covered by unit tests. */
export function assertStudentCanBook(
  student: StudentState | null,
): asserts student is StudentState {
  if (!student) {
    throw notFoundError('Tu perfil de alumno no existe.');
  }
  if (!student.active) {
    throw forbiddenError('Tu cuenta está deshabilitada. Comunicate con el gimnasio.');
  }
}

export function assertSlotBookable(
  slot: SlotState | null,
  alreadyBooked: boolean,
  now: number,
): asserts slot is SlotState {
  if (!slot) {
    throw notFoundError('El horario no existe.');
  }
  if (!slot.enabled) {
    throw failedPreconditionError('Ese horario no está disponible.');
  }
  if (slot.startsAt <= now) {
    throw failedPreconditionError('Ese horario ya pasó.');
  }
  if (alreadyBooked) {
    throw failedPreconditionError('Ya tenés una reserva en ese horario.');
  }
  if (slot.bookedCount >= slot.capacity) {
    throw exhaustedError('No quedan lugares en ese horario.');
  }
}

export function assertBookingCancellable(
  slot: SlotState | null,
  hasConfirmedBooking: boolean,
  now: number,
): asserts slot is SlotState {
  if (!slot) {
    throw notFoundError('El horario no existe.');
  }
  if (!hasConfirmedBooking) {
    throw failedPreconditionError('No tenés una reserva en ese horario.');
  }
  if (slot.startsAt <= now) {
    throw failedPreconditionError('No se puede cancelar una reserva que ya pasó.');
  }
}
