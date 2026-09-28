import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { messageFromError } from '@core/firebase/firebase-error';
import { RecipesService } from '@core/services/recipes.service';
import { Button } from '@shared/components/button/button';
import { FormField } from '@shared/components/form-field/form-field';
import { Icon } from '@shared/components/icon/icon';
import {
  Recipe,
  RECIPE_CATEGORIES,
  RECIPE_CATEGORY_LABELS,
  RecipeInput,
} from '@shared/models/recipe';
import { controlError } from '@shared/utilities/validators';

type NumericField = 'calories' | 'protein' | 'carbohydrates' | 'fat';

/** Recipe editor. Ingredients and steps are entered one per line; the image goes to Storage. */
@Component({
  selector: 'app-recipe-form',
  imports: [ReactiveFormsModule, Button, FormField, Icon],
  templateUrl: './recipe-form.html',
  styleUrl: './recipe-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeForm {
  private readonly fb = inject(FormBuilder);
  private readonly recipesService = inject(RecipesService);

  readonly recipe = input<Recipe | null>(null);
  readonly submitting = input(false);
  readonly save = output<RecipeInput>();
  readonly cancelled = output<void>();

  protected readonly categories = RECIPE_CATEGORIES;
  protected readonly categoryLabels = RECIPE_CATEGORY_LABELS;
  protected readonly uploading = signal(false);
  protected readonly uploadError = signal('');
  protected readonly image = signal<{ imageUrl: string; imagePath: string }>({
    imageUrl: '',
    imagePath: '',
  });

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.maxLength(1000)]],
    category: ['lunch' as Recipe['category'], [Validators.required]],
    tags: ['', [Validators.maxLength(300)]],
    preparationTime: [20, [Validators.required, Validators.min(1), Validators.max(1440)]],
    calories: this.fb.control<number | null>(null, [Validators.min(0)]),
    protein: this.fb.control<number | null>(null, [Validators.min(0)]),
    carbohydrates: this.fb.control<number | null>(null, [Validators.min(0)]),
    fat: this.fb.control<number | null>(null, [Validators.min(0)]),
    ingredients: ['', [Validators.required, Validators.maxLength(4000)]],
    instructions: ['', [Validators.required, Validators.maxLength(8000)]],
    active: [true],
  });

  constructor() {
    effect(() => {
      const recipe = this.recipe();
      if (recipe) {
        this.form.patchValue({
          ...recipe,
          tags: recipe.tags.join(', '),
          ingredients: recipe.ingredients.join('\n'),
          instructions: recipe.instructions.join('\n'),
        });
        this.image.set({ imageUrl: recipe.imageUrl, imagePath: recipe.imagePath });
      } else {
        this.form.reset({ category: 'lunch', preparationTime: 20, active: true });
        this.image.set({ imageUrl: '', imagePath: '' });
      }
    });
  }

  protected error(control: keyof RecipeForm['form']['controls']): string {
    return controlError(this.form.controls[control]);
  }

  protected async onFileSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    this.uploading.set(true);
    this.uploadError.set('');
    try {
      const previous = this.image().imagePath;
      this.image.set(await this.recipesService.uploadImage(file));
      if (previous) {
        await this.recipesService.deleteImage(previous);
      }
    } catch (error) {
      this.uploadError.set(messageFromError(error));
    } finally {
      this.uploading.set(false);
      (event.target as HTMLInputElement).value = '';
    }
  }

  protected async removeImage(): Promise<void> {
    const current = this.image();
    this.image.set({ imageUrl: '', imagePath: '' });
    if (current.imagePath) {
      await this.recipesService.deleteImage(current.imagePath);
    }
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting() || this.uploading()) {
      return;
    }
    const raw = this.form.getRawValue();
    this.save.emit({
      title: raw.title.trim(),
      description: raw.description.trim(),
      category: raw.category,
      tags: splitList(raw.tags, ','),
      preparationTime: raw.preparationTime,
      calories: numberOrNull(raw.calories),
      protein: numberOrNull(raw.protein),
      carbohydrates: numberOrNull(raw.carbohydrates),
      fat: numberOrNull(raw.fat),
      ingredients: splitList(raw.ingredients, '\n'),
      instructions: splitList(raw.instructions, '\n'),
      active: raw.active,
      ...this.image(),
    });
  }

  protected numericFields: readonly { key: NumericField; label: string; unit: string }[] = [
    { key: 'calories', label: 'Calorías', unit: 'kcal' },
    { key: 'protein', label: 'Proteínas', unit: 'g' },
    { key: 'carbohydrates', label: 'Carbohidratos', unit: 'g' },
    { key: 'fat', label: 'Grasas', unit: 'g' },
  ];
}

function splitList(value: string, separator: string): string[] {
  return value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

function numberOrNull(value: number | null): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
