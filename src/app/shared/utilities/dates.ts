/** Date helpers around ISO `YYYY-MM-DD` / `HH:mm` strings in the browser's local time zone. */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME = /^(\d{2}):(\d{2})$/;

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function isIsoDate(value: string): boolean {
  return ISO_DATE.test(value) && !Number.isNaN(parseIsoDate(value).getTime());
}

export function isTime(value: string): boolean {
  const match = TIME.exec(value);
  return !!match && Number(match[1]) < 24 && Number(match[2]) < 60;
}

/** Parses an ISO date as local midnight. */
export function parseIsoDate(iso: string): Date {
  const match = ISO_DATE.exec(iso);
  if (!match) {
    return new Date(NaN);
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/** Epoch millis of a local date + time. */
export function toEpoch(isoDate: string, time: string): number {
  const date = parseIsoDate(isoDate);
  const match = TIME.exec(time);
  if (Number.isNaN(date.getTime()) || !match) {
    return NaN;
  }
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return date.getTime();
}

export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

/** 0 = Sunday … 6 = Saturday, matching `Date.getDay()`. */
export function weekdayOf(iso: string): number {
  return parseIsoDate(iso).getDay();
}

export const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;
export const WEEKDAY_LONG_LABELS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
] as const;

const longFormatter = new Intl.DateTimeFormat('es-UY', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
const shortFormatter = new Intl.DateTimeFormat('es-UY', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

/** "lunes, 15 de septiembre" */
export function formatDateLong(iso: string): string {
  const date = parseIsoDate(iso);
  return Number.isNaN(date.getTime()) ? iso : longFormatter.format(date);
}

/** "15/09/2026" */
export function formatDateShort(iso: string): string {
  const date = parseIsoDate(iso);
  return Number.isNaN(date.getTime()) ? iso : shortFormatter.format(date);
}

/** Inclusive list of ISO dates between two dates. */
export function dateRange(fromIso: string, toIso: string): string[] {
  const dates: string[] = [];
  for (let d = fromIso; d <= toIso; d = addDays(d, 1)) {
    dates.push(d);
    if (dates.length > 400) {
      break;
    }
  }
  return dates;
}
