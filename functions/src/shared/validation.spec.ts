import { describe, expect, it } from 'vitest';
import { HttpsError } from 'firebase-functions/v2/https';
import {
  asRecord,
  optionalIsoDate,
  optionalString,
  requireBoolean,
  requireEmail,
  requireString,
} from './validation';

function codeOf(fn: () => unknown): string | undefined {
  try {
    fn();
    return undefined;
  } catch (error) {
    return error instanceof HttpsError ? error.code : 'unexpected';
  }
}

describe('validation helpers', () => {
  it('asRecord rejects non-objects', () => {
    expect(codeOf(() => asRecord(null))).toBe('invalid-argument');
    expect(codeOf(() => asRecord([]))).toBe('invalid-argument');
    expect(asRecord({ a: 1 })).toEqual({ a: 1 });
  });

  it('requireString trims and enforces presence and length', () => {
    expect(requireString({ n: '  Ana ' }, 'n', 'El nombre')).toBe('Ana');
    expect(codeOf(() => requireString({ n: '   ' }, 'n', 'El nombre'))).toBe('invalid-argument');
    expect(codeOf(() => requireString({ n: 'x'.repeat(5) }, 'n', 'El nombre', 4))).toBe(
      'invalid-argument',
    );
  });

  it('optionalString accepts missing values and rejects wrong types', () => {
    expect(optionalString({}, 'p', 'El teléfono')).toBe('');
    expect(optionalString({ p: null }, 'p', 'El teléfono')).toBe('');
    expect(codeOf(() => optionalString({ p: 5 }, 'p', 'El teléfono'))).toBe('invalid-argument');
  });

  it('requireEmail lower-cases and validates format', () => {
    expect(requireEmail({ email: ' Ana@Gym.Local ' })).toBe('ana@gym.local');
    expect(codeOf(() => requireEmail({ email: 'not-an-email' }))).toBe('invalid-argument');
  });

  it('optionalIsoDate validates the AAAA-MM-DD format', () => {
    expect(optionalIsoDate({ d: '2026-09-13' }, 'd', 'La fecha')).toBe('2026-09-13');
    expect(optionalIsoDate({}, 'd', 'La fecha')).toBe('');
    expect(codeOf(() => optionalIsoDate({ d: '13/09/2026' }, 'd', 'La fecha'))).toBe(
      'invalid-argument',
    );
  });

  it('requireBoolean only accepts real booleans', () => {
    expect(requireBoolean({ a: false }, 'a', 'El estado')).toBe(false);
    expect(codeOf(() => requireBoolean({ a: 'true' }, 'a', 'El estado'))).toBe('invalid-argument');
  });
});
