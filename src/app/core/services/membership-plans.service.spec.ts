import { MembershipPlan } from '@shared/models/membership-plan';
import { sortPlans, toMembershipPlan } from './membership-plans.service';

describe('toMembershipPlan', () => {
  it('maps a well-formed document', () => {
    const plan = toMembershipPlan('p1', {
      name: 'Pase libre',
      description: 'Todos los días',
      price: 3200,
      currency: 'UYU',
      frequency: 'monthly',
      features: ['A', 'B'],
      highlighted: true,
      active: true,
      displayOrder: 3,
    });
    expect(plan).toEqual<MembershipPlan>({
      id: 'p1',
      name: 'Pase libre',
      description: 'Todos los días',
      price: 3200,
      currency: 'UYU',
      frequency: 'monthly',
      features: ['A', 'B'],
      highlighted: true,
      active: true,
      displayOrder: 3,
    });
  });

  it('applies safe defaults to missing or malformed fields', () => {
    const plan = toMembershipPlan('bad', {
      name: 42,
      price: '100',
      frequency: 'weekly',
      features: ['ok', 7, null],
      highlighted: 'yes',
    });
    expect(plan.name).toBe('');
    expect(plan.price).toBe(0);
    expect(plan.currency).toBe('UYU');
    expect(plan.frequency).toBe('monthly');
    expect(plan.features).toEqual(['ok']);
    expect(plan.highlighted).toBe(false);
    expect(plan.active).toBe(false);
    expect(plan.displayOrder).toBe(0);
  });
});

describe('sortPlans', () => {
  const base = toMembershipPlan('x', {});

  it('orders by displayOrder, then by name, without mutating the input', () => {
    const input = [
      { ...base, id: 'c', name: 'Zeta', displayOrder: 2 },
      { ...base, id: 'a', name: 'Beta', displayOrder: 1 },
      { ...base, id: 'b', name: 'Alfa', displayOrder: 2 },
    ];
    const sorted = sortPlans(input);
    expect(sorted.map((p) => p.id)).toEqual(['a', 'b', 'c']);
    expect(input.map((p) => p.id)).toEqual(['c', 'a', 'b']);
  });
});
