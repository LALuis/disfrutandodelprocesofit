export interface Exercise {
  readonly name: string;
  readonly sets: number;
  readonly reps: string;
  readonly rest: string;
  readonly notes: string;
  readonly targetWeight: string;
}

export interface WorkoutDay {
  readonly id: string;
  readonly name: string;
  readonly focus: string;
  readonly exercises: readonly Exercise[];
}

/**
 * Document shape of `users/{uid}/trainingPlans/{id}`. Days and exercises are embedded:
 * a plan is always read as a whole and stays small. The same shape can back reusable
 * templates in a top-level collection later on.
 */
export interface TrainingPlan {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** ISO date `YYYY-MM-DD`. */
  readonly startDate: string;
  readonly endDate: string;
  readonly active: boolean;
  readonly days: readonly WorkoutDay[];
}

export type TrainingPlanInput = Omit<TrainingPlan, 'id'>;
