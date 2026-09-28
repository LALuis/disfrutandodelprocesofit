import { UserRole } from '@core/auth/auth.models';

/** Per-user feature switches. Enforced in navigation, guards and Firestore rules. */
export interface UserFeatures {
  readonly nutritionEnabled: boolean;
  readonly recipesEnabled: boolean;
}

export const FEATURE_KEYS = ['nutritionEnabled', 'recipesEnabled'] as const;
export type FeatureKey = (typeof FEATURE_KEYS)[number];

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  nutritionEnabled: 'Nutrición',
  recipesEnabled: 'Recetario',
};

export const DEFAULT_FEATURES: UserFeatures = {
  nutritionEnabled: false,
  recipesEnabled: false,
};

/** Document shape of `users/{uid}`. */
export interface UserProfile {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string;
  /** ISO date `YYYY-MM-DD` or empty. */
  readonly birthDate: string;
  readonly active: boolean;
  /** ISO date `YYYY-MM-DD`. */
  readonly joinDate: string;
  readonly notes: string;
  readonly role: UserRole | null;
  readonly features: UserFeatures;
  readonly activeTrainingPlanId: string | null;
  readonly activeNutritionPlanId: string | null;
}

/** Fields an admin may edit directly on the profile (role and email are managed server-side). */
export interface UserProfileUpdate {
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly birthDate: string;
  readonly joinDate: string;
  readonly notes: string;
  readonly features: UserFeatures;
}

export function fullName(profile: Pick<UserProfile, 'firstName' | 'lastName'>): string {
  return `${profile.firstName} ${profile.lastName}`.trim();
}

export function initials(profile: Pick<UserProfile, 'firstName' | 'lastName'>): string {
  return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
}
