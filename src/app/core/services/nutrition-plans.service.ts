import { inject, Injectable } from '@angular/core';
import { bool, converterFor, oneOf, recordArray, str } from '@core/firebase/firestore.utils';
import { FIRESTORE } from '@core/firebase/firebase.tokens';
import { Meal, MEAL_TYPES, NutritionPlan } from '@shared/models/nutrition-plan';
import { UserPlansStore } from './user-plans.store';

export const NUTRITION_PLANS_COLLECTION = 'nutritionPlans';

export function toNutritionPlan(id: string, data: Record<string, unknown>): NutritionPlan {
  return {
    id,
    title: str(data, 'title'),
    description: str(data, 'description'),
    objective: str(data, 'objective'),
    startDate: str(data, 'startDate'),
    endDate: str(data, 'endDate'),
    notes: str(data, 'notes'),
    active: bool(data, 'active'),
    meals: recordArray(data, 'meals').map((meal): Meal => ({
      id: str(meal, 'id'),
      type: oneOf(meal, 'type', MEAL_TYPES, 'other'),
      name: str(meal, 'name'),
      description: str(meal, 'description'),
      notes: str(meal, 'notes'),
      foods: recordArray(meal, 'foods').map((food) => ({
        name: str(food, 'name'),
        quantity: str(food, 'quantity'),
        notes: str(food, 'notes'),
      })),
    })),
  };
}

/** Nutrition plans under `users/{uid}/nutritionPlans` (see `UserPlansStore`). */
@Injectable({ providedIn: 'root' })
export class NutritionPlansService extends UserPlansStore<NutritionPlan> {
  constructor() {
    super(
      inject(FIRESTORE),
      NUTRITION_PLANS_COLLECTION,
      converterFor(toNutritionPlan),
      'activeNutritionPlanId',
    );
  }
}
