import { toBooking } from './bookings.service';
import { toMeasurement } from './measurements.service';
import { toNutritionPlan } from './nutrition-plans.service';
import { toRecipe } from './recipes.service';
import { slotIdFor, toScheduleSlot } from './schedule.service';
import { toTrainingPlan } from './training-plans.service';
import { toUserProfile } from './users.service';

describe('Firestore document mappers', () => {
  it('toUserProfile applies defaults and parses roles/features defensively', () => {
    const profile = toUserProfile('u1', {
      firstName: 'Ana',
      lastName: 'Pérez',
      email: 'ana@gym.local',
      role: 'STUDENT',
      active: true,
      features: { nutritionEnabled: true, recipesEnabled: 'yes' },
      activeTrainingPlanId: 'p1',
    });
    expect(profile.role).toBe('STUDENT');
    expect(profile.features).toEqual({ nutritionEnabled: true, recipesEnabled: false });
    expect(profile.activeTrainingPlanId).toBe('p1');
    expect(profile.activeNutritionPlanId).toBeNull();
    expect(profile.phone).toBe('');

    expect(toUserProfile('u2', { role: 'ROOT' }).role).toBeNull();
    expect(toUserProfile('u2', {}).active).toBe(false);
  });

  it('toMeasurement keeps only finite numbers', () => {
    const m = toMeasurement('m1', { date: '2026-01-01', weight: 80.5, waist: 'x', arm: null });
    expect(m.weight).toBe(80.5);
    expect(m.waist).toBeNull();
    expect(m.arm).toBeNull();
    expect(m.notes).toBe('');
  });

  it('toTrainingPlan and toNutritionPlan normalise nested arrays', () => {
    const plan = toTrainingPlan('t1', {
      name: 'Plan',
      active: true,
      days: [
        { id: 'a', name: 'Día A', exercises: [{ name: 'Press', sets: 4, reps: '8' }, 'junk'] },
        null,
      ],
    });
    expect(plan.days).toHaveLength(1);
    expect(plan.days[0].exercises).toEqual([
      { name: 'Press', sets: 4, reps: '8', rest: '', notes: '', targetWeight: '' },
    ]);

    const nutrition = toNutritionPlan('n1', {
      title: 'Plan',
      meals: [{ id: 'm', type: 'brunch', foods: [{ name: 'Avena', quantity: '50 g' }] }],
    });
    expect(nutrition.meals[0].type).toBe('other');
    expect(nutrition.meals[0].foods[0]).toEqual({ name: 'Avena', quantity: '50 g', notes: '' });
  });

  it('toRecipe falls back to a valid category and string arrays', () => {
    const recipe = toRecipe('r1', {
      title: 'Bowl',
      category: 'unknown',
      ingredients: ['a', 1, null],
      calories: 300,
      protein: 'x',
      active: true,
    });
    expect(recipe.category).toBe('lunch');
    expect(recipe.ingredients).toEqual(['a']);
    expect(recipe.calories).toBe(300);
    expect(recipe.protein).toBeNull();
  });

  it('toScheduleSlot / slotIdFor / toBooking', () => {
    const slot = toScheduleSlot('s', {
      date: '2026-09-14',
      startTime: '08:00',
      capacity: 8,
      enabled: true,
    });
    expect(slot.bookedCount).toBe(0);
    expect(slot.durationMinutes).toBe(60);
    expect(slotIdFor('2026-09-14', '08:00')).toBe('2026-09-14_0800');

    const booking = toBooking('b', { slotId: 's', userId: 'u', status: 'weird' });
    expect(booking.status).toBe('cancelled');
  });
});
