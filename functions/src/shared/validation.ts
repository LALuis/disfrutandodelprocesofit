import { invalidArgumentError } from './errors';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Narrow unknown callable payloads to a plain object. */
export function asRecord(data: unknown): Record<string, unknown> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw invalidArgumentError('Datos inválidos.');
  }
  return data as Record<string, unknown>;
}

export function requireString(
  data: Record<string, unknown>,
  key: string,
  label: string,
  maxLength = 200,
): string {
  const value = data[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw invalidArgumentError(`${label} es obligatorio.`);
  }
  if (value.length > maxLength) {
    throw invalidArgumentError(`${label} es demasiado largo.`);
  }
  return value.trim();
}

export function optionalString(
  data: Record<string, unknown>,
  key: string,
  label: string,
  maxLength = 500,
): string {
  const value = data[key];
  if (value === undefined || value === null || value === '') {
    return '';
  }
  if (typeof value !== 'string') {
    throw invalidArgumentError(`${label} es inválido.`);
  }
  if (value.length > maxLength) {
    throw invalidArgumentError(`${label} es demasiado largo.`);
  }
  return value.trim();
}

export function requireEmail(data: Record<string, unknown>, key = 'email'): string {
  const value = requireString(data, key, 'El email', 254).toLowerCase();
  if (!EMAIL.test(value)) {
    throw invalidArgumentError('El email no tiene un formato válido.');
  }
  return value;
}

export function optionalIsoDate(data: Record<string, unknown>, key: string, label: string): string {
  const value = optionalString(data, key, label, 10);
  if (value && (!ISO_DATE.test(value) || Number.isNaN(Date.parse(value)))) {
    throw invalidArgumentError(`${label} debe tener formato AAAA-MM-DD.`);
  }
  return value;
}

export function requireBoolean(data: Record<string, unknown>, key: string, label: string): boolean {
  const value = data[key];
  if (typeof value !== 'boolean') {
    throw invalidArgumentError(`${label} es inválido.`);
  }
  return value;
}

export function optionalBoolean(
  data: Record<string, unknown>,
  key: string,
  fallback: boolean,
): boolean {
  const value = data[key];
  return typeof value === 'boolean' ? value : fallback;
}
