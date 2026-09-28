import { Recipe } from '@shared/models/recipe';
import { DEFAULT_FEATURES, UserProfile } from '@shared/models/user-profile';
import { filterStudents } from './admin/students/students-page';
import { filterRecipes } from './student/recipes/recipes-page';
import { buildSeries } from './student/progress/progress-page';
import { toMeasurement } from '@core/services/measurements.service';

function student(overrides: Partial<UserProfile>): UserProfile {
  return {
    id: 'u',
    firstName: 'Ana',
    lastName: 'Pérez',
    email: 'ana@gym.local',
    phone: '099',
    birthDate: '',
    active: true,
    joinDate: '',
    notes: '',
    role: 'STUDENT',
    features: DEFAULT_FEATURES,
    activeTrainingPlanId: null,
    activeNutritionPlanId: null,
    ...overrides,
  };
}

function recipe(overrides: Partial<Recipe>): Recipe {
  return {
    id: 'r',
    title: 'Bowl',
    description: '',
    imageUrl: '',
    imagePath: '',
    ingredients: ['pollo'],
    instructions: [],
    preparationTime: 10,
    calories: null,
    protein: null,
    carbohydrates: null,
    fat: null,
    category: 'lunch',
    tags: [],
    active: true,
    ...overrides,
  };
}

describe('filterStudents', () => {
  const list = [
    student({ id: '1', firstName: 'Ana', lastName: 'Pérez' }),
    student({
      id: '2',
      firstName: 'Martín',
      lastName: 'Rodríguez',
      email: 'm@gym.local',
      active: false,
    }),
  ];

  it('matches name, email or phone case-insensitively', () => {
    expect(filterStudents(list, 'rodr', 'all').map((s) => s.id)).toEqual(['2']);
    expect(filterStudents(list, 'M@GYM', 'all').map((s) => s.id)).toEqual(['2']);
    expect(filterStudents(list, '099', 'all').map((s) => s.id)).toEqual(['1', '2']);
  });

  it('filters by status', () => {
    expect(filterStudents(list, '', 'active').map((s) => s.id)).toEqual(['1']);
    expect(filterStudents(list, '', 'inactive').map((s) => s.id)).toEqual(['2']);
  });
});

describe('filterRecipes', () => {
  const list = [
    recipe({ id: 'a', title: 'Bowl de pollo', category: 'lunch', tags: ['meal prep'] }),
    recipe({ id: 'b', title: 'Panqueques', category: 'breakfast', ingredients: ['avena'] }),
  ];

  it('combines category and free text over title, tags and ingredients', () => {
    expect(filterRecipes(list, '', 'breakfast').map((r) => r.id)).toEqual(['b']);
    expect(filterRecipes(list, 'avena', 'all').map((r) => r.id)).toEqual(['b']);
    expect(filterRecipes(list, 'prep', 'all').map((r) => r.id)).toEqual(['a']);
    expect(filterRecipes(list, 'prep', 'breakfast')).toEqual([]);
  });
});

describe('buildSeries', () => {
  it('produces oldest-first chart points only for metrics with data', () => {
    const history = [
      toMeasurement('2', { date: '2026-03-01', weight: 90, bodyFatPercentage: 20 }),
      toMeasurement('1', { date: '2026-02-01', weight: 92 }),
    ];
    const series = buildSeries(history);
    expect(series.map((s) => s.metric)).toEqual(['weight', 'bodyFatPercentage']);
    expect(series[0].points.map((p) => p.value)).toEqual([92, 90]);
    expect(series[0].comparison.change).toBe(-2);
    expect(series[1].points).toHaveLength(1);
  });
});
