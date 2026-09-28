import { inject, Injectable } from '@angular/core';
import { bool, converterFor, num, recordArray, str } from '@core/firebase/firestore.utils';
import { FIRESTORE } from '@core/firebase/firebase.tokens';
import { TrainingPlan, WorkoutDay } from '@shared/models/training-plan';
import { UserPlansStore } from './user-plans.store';

export const TRAINING_PLANS_COLLECTION = 'trainingPlans';

export function toTrainingPlan(id: string, data: Record<string, unknown>): TrainingPlan {
  return {
    id,
    name: str(data, 'name'),
    description: str(data, 'description'),
    startDate: str(data, 'startDate'),
    endDate: str(data, 'endDate'),
    active: bool(data, 'active'),
    days: recordArray(data, 'days').map((day): WorkoutDay => ({
      id: str(day, 'id'),
      name: str(day, 'name'),
      focus: str(day, 'focus'),
      exercises: recordArray(day, 'exercises').map((exercise) => ({
        name: str(exercise, 'name'),
        sets: num(exercise, 'sets'),
        reps: str(exercise, 'reps'),
        rest: str(exercise, 'rest'),
        notes: str(exercise, 'notes'),
        targetWeight: str(exercise, 'targetWeight'),
      })),
    })),
  };
}

/** Training plans under `users/{uid}/trainingPlans` (see `UserPlansStore`). */
@Injectable({ providedIn: 'root' })
export class TrainingPlansService extends UserPlansStore<TrainingPlan> {
  constructor() {
    super(
      inject(FIRESTORE),
      TRAINING_PLANS_COLLECTION,
      converterFor(toTrainingPlan),
      'activeTrainingPlanId',
    );
  }
}
