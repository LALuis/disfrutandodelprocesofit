export const RECIPE_CATEGORIES = [
  'breakfast',
  'lunch',
  'snack',
  'dinner',
  'highProtein',
  'lowCalorie',
] as const;
export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];

export const RECIPE_CATEGORY_LABELS: Record<RecipeCategory, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  snack: 'Snack',
  dinner: 'Cena',
  highProtein: 'Alta en proteína',
  lowCalorie: 'Baja en calorías',
};

/** Document shape of `recipes/{id}`. Images live in Storage under `recipes/`. */
export interface Recipe {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly imageUrl: string;
  /** Storage object path, kept to delete/replace the image. */
  readonly imagePath: string;
  readonly ingredients: readonly string[];
  readonly instructions: readonly string[];
  /** Minutes. */
  readonly preparationTime: number;
  readonly calories: number | null;
  readonly protein: number | null;
  readonly carbohydrates: number | null;
  readonly fat: number | null;
  readonly category: RecipeCategory;
  readonly tags: readonly string[];
  readonly active: boolean;
}

export type RecipeInput = Omit<Recipe, 'id'>;
