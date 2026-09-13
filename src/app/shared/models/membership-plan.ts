export const PLAN_FREQUENCIES = ['monthly', 'quarterly', 'yearly'] as const;
export type PlanFrequency = (typeof PLAN_FREQUENCIES)[number];

/** Document shape of `membershipPlans/{planId}` (not to be confused with training/nutrition plans). */
export interface MembershipPlan {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  /** ISO 4217 code, e.g. `UYU`. */
  readonly currency: string;
  readonly frequency: PlanFrequency;
  readonly features: readonly string[];
  readonly highlighted: boolean;
  readonly active: boolean;
  readonly displayOrder: number;
}

export const PLAN_FREQUENCY_LABELS: Record<PlanFrequency, string> = {
  monthly: 'por mes',
  quarterly: 'por trimestre',
  yearly: 'por año',
};
