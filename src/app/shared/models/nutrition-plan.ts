export const MEAL_TYPES = [
  'breakfast',
  'midMorning',
  'lunch',
  'afternoonSnack',
  'dinner',
  'other',
] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Desayuno',
  midMorning: 'Media mañana',
  lunch: 'Almuerzo',
  afternoonSnack: 'Merienda',
  dinner: 'Cena',
  other: 'Comida adicional',
};

export interface FoodItem {
  readonly name: string;
  readonly quantity: string;
  readonly notes: string;
}

export interface Meal {
  readonly id: string;
  readonly type: MealType;
  readonly name: string;
  readonly description: string;
  readonly foods: readonly FoodItem[];
  readonly notes: string;
}

/** Document shape of `users/{uid}/nutritionPlans/{id}`. Meals are embedded. */
export interface NutritionPlan {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly objective: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly notes: string;
  readonly active: boolean;
  readonly meals: readonly Meal[];
}

export type NutritionPlanInput = Omit<NutritionPlan, 'id'>;
