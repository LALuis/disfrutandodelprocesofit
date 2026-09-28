import { compareMetric, Measurement } from './measurement';
import { isSlotFull, isSlotPast, remainingCapacity } from './schedule';
import { fullName, initials } from './user-profile';

function measurement(
  date: string,
  weight: number | null,
  muscleMass: number | null = null,
): Measurement {
  return {
    id: date,
    date,
    notes: '',
    weight,
    height: null,
    bodyFatPercentage: null,
    muscleMass,
    waist: null,
    chest: null,
    hip: null,
    arm: null,
    thigh: null,
  };
}

describe('compareMetric', () => {
  it('compares the two most recent recorded values of a metric', () => {
    const history = [measurement('2026-03-01', 96.4), measurement('2026-02-01', 98.1)];
    expect(compareMetric(history, 'weight')).toEqual({
      metric: 'weight',
      current: 96.4,
      previous: 98.1,
      change: -1.7,
    });
  });

  it('skips entries where the metric was not recorded', () => {
    const history = [
      measurement('2026-03-01', null, 35),
      measurement('2026-02-01', 90, 34),
      measurement('2026-01-01', 92, null),
    ];
    expect(compareMetric(history, 'weight')).toEqual({
      metric: 'weight',
      current: 90,
      previous: 92,
      change: -2,
    });
    expect(compareMetric(history, 'muscleMass').change).toBe(1);
  });

  it('returns nulls without enough data', () => {
    expect(compareMetric([measurement('2026-01-01', 80)], 'weight')).toEqual({
      metric: 'weight',
      current: 80,
      previous: null,
      change: null,
    });
    expect(compareMetric([], 'weight').current).toBeNull();
  });
});

describe('schedule helpers', () => {
  it('derives remaining capacity and fullness', () => {
    expect(remainingCapacity({ capacity: 5, bookedCount: 2 })).toBe(3);
    expect(remainingCapacity({ capacity: 2, bookedCount: 3 })).toBe(0);
    expect(isSlotFull({ capacity: 2, bookedCount: 2 })).toBe(true);
    expect(isSlotFull({ capacity: 2, bookedCount: 1 })).toBe(false);
  });

  it('treats slots that already started as past', () => {
    expect(isSlotPast({ startsAt: 1000 }, 1000)).toBe(true);
    expect(isSlotPast({ startsAt: 1001 }, 1000)).toBe(false);
  });
});

describe('user profile helpers', () => {
  it('formats names and initials', () => {
    expect(fullName({ firstName: 'Ana', lastName: 'Pérez' })).toBe('Ana Pérez');
    expect(fullName({ firstName: 'Ana', lastName: '' })).toBe('Ana');
    expect(initials({ firstName: 'ana', lastName: 'pérez' })).toBe('AP');
  });
});
