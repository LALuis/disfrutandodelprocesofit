import { describe, expect, it } from 'vitest';
import { HttpsError } from 'firebase-functions/v2/https';
import {
  assertBookingCancellable,
  assertSlotBookable,
  assertStudentCanBook,
  SlotState,
  toSlotState,
} from './booking-rules';

const NOW = 1_000_000;
const slot = (overrides: Partial<SlotState> = {}): SlotState => ({
  enabled: true,
  capacity: 2,
  bookedCount: 0,
  startsAt: NOW + 60_000,
  ...overrides,
});

function codeOf(fn: () => void): string | undefined {
  try {
    fn();
    return undefined;
  } catch (error) {
    return error instanceof HttpsError ? error.code : 'unexpected';
  }
}

describe('assertSlotBookable', () => {
  it('allows an enabled, future slot with free capacity', () => {
    expect(codeOf(() => assertSlotBookable(slot(), false, NOW))).toBeUndefined();
  });

  it('rejects a missing slot', () => {
    expect(codeOf(() => assertSlotBookable(null, false, NOW))).toBe('not-found');
  });

  it('rejects disabled slots', () => {
    expect(codeOf(() => assertSlotBookable(slot({ enabled: false }), false, NOW))).toBe(
      'failed-precondition',
    );
  });

  it('rejects slots that already started', () => {
    expect(codeOf(() => assertSlotBookable(slot({ startsAt: NOW }), false, NOW))).toBe(
      'failed-precondition',
    );
  });

  it('rejects duplicate bookings before checking capacity', () => {
    expect(codeOf(() => assertSlotBookable(slot({ bookedCount: 2 }), true, NOW))).toBe(
      'failed-precondition',
    );
  });

  it('rejects full slots with resource-exhausted', () => {
    expect(codeOf(() => assertSlotBookable(slot({ bookedCount: 2 }), false, NOW))).toBe(
      'resource-exhausted',
    );
  });
});

describe('assertBookingCancellable', () => {
  it('allows cancelling a confirmed booking of a future slot', () => {
    expect(codeOf(() => assertBookingCancellable(slot(), true, NOW))).toBeUndefined();
  });

  it('rejects when there is no confirmed booking', () => {
    expect(codeOf(() => assertBookingCancellable(slot(), false, NOW))).toBe('failed-precondition');
  });

  it('rejects cancelling past slots', () => {
    expect(codeOf(() => assertBookingCancellable(slot({ startsAt: NOW - 1 }), true, NOW))).toBe(
      'failed-precondition',
    );
  });
});

describe('assertStudentCanBook', () => {
  it('requires an existing, active profile', () => {
    expect(codeOf(() => assertStudentCanBook(null))).toBe('not-found');
    expect(
      codeOf(() => assertStudentCanBook({ active: false, firstName: 'A', lastName: 'B' })),
    ).toBe('permission-denied');
    expect(
      codeOf(() => assertStudentCanBook({ active: true, firstName: 'A', lastName: 'B' })),
    ).toBeUndefined();
  });
});

describe('toSlotState', () => {
  it('normalises malformed documents defensively', () => {
    expect(toSlotState(undefined)).toBeNull();
    expect(toSlotState({ enabled: 'yes', capacity: '5' })).toEqual({
      enabled: false,
      capacity: 0,
      bookedCount: 0,
      startsAt: 0,
    });
  });
});
