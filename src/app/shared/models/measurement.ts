/** Numeric measurement fields. All optional: the coach records what was measured that day. */
export const MEASUREMENT_METRICS = [
  'weight',
  'height',
  'bodyFatPercentage',
  'muscleMass',
  'waist',
  'chest',
  'hip',
  'arm',
  'thigh',
] as const;
export type MeasurementMetric = (typeof MEASUREMENT_METRICS)[number];

export interface MetricMeta {
  readonly label: string;
  readonly unit: string;
}

export const METRIC_META: Record<MeasurementMetric, MetricMeta> = {
  weight: { label: 'Peso', unit: 'kg' },
  height: { label: 'Altura', unit: 'cm' },
  bodyFatPercentage: { label: 'Grasa corporal', unit: '%' },
  muscleMass: { label: 'Masa muscular', unit: 'kg' },
  waist: { label: 'Cintura', unit: 'cm' },
  chest: { label: 'Pecho', unit: 'cm' },
  hip: { label: 'Cadera', unit: 'cm' },
  arm: { label: 'Brazo', unit: 'cm' },
  thigh: { label: 'Muslo', unit: 'cm' },
};

export type MeasurementValues = Readonly<Record<MeasurementMetric, number | null>>;

/** Document shape of `users/{uid}/measurements/{id}`. History is append-only. */
export interface Measurement extends MeasurementValues {
  readonly id: string;
  /** ISO date `YYYY-MM-DD`. */
  readonly date: string;
  readonly notes: string;
}

export type MeasurementInput = Omit<Measurement, 'id'>;

/** Current vs previous value of a metric, as shown on progress cards. */
export interface MetricComparison {
  readonly metric: MeasurementMetric;
  readonly current: number | null;
  readonly previous: number | null;
  readonly change: number | null;
}

/**
 * Builds the comparison for a metric from measurements sorted newest first,
 * skipping entries where the metric was not recorded.
 */
export function compareMetric(
  sortedDesc: readonly Measurement[],
  metric: MeasurementMetric,
): MetricComparison {
  const values = sortedDesc.map((m) => m[metric]).filter((v): v is number => v !== null);
  const current = values[0] ?? null;
  const previous = values[1] ?? null;
  const change = current !== null && previous !== null ? round1(current - previous) : null;
  return { metric, current, previous, change };
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
