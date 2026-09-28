import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@shared/components/button/button';
import { FormField } from '@shared/components/form-field/form-field';
import { Icon } from '@shared/components/icon/icon';
import {
  FoodItem,
  Meal,
  MEAL_TYPE_LABELS,
  MEAL_TYPES,
  MealType,
  NutritionPlan,
  NutritionPlanInput,
} from '@shared/models/nutrition-plan';
import { todayIso } from '@shared/utilities/dates';
import { controlError, isoDateValidator } from '@shared/utilities/validators';

type FoodGroup = ReturnType<NutritionPlanForm['foodGroup']>;
type MealGroup = ReturnType<NutritionPlanForm['mealGroup']>;

const DEFAULT_MEALS: readonly MealType[] = [
  'breakfast',
  'midMorning',
  'lunch',
  'afternoonSnack',
  'dinner',
];

/** Nested reactive form: plan → meals → foods. Emits a normalised `NutritionPlanInput`. */
@Component({
  selector: 'app-nutrition-plan-form',
  imports: [ReactiveFormsModule, Button, FormField, Icon],
  templateUrl: './nutrition-plan-form.html',
  styleUrl: './nutrition-plan-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NutritionPlanForm {
  private readonly fb = inject(FormBuilder);

  readonly plan = input<NutritionPlan | null>(null);
  readonly submitting = input(false);
  readonly save = output<NutritionPlanInput>();
  readonly cancelled = output<void>();

  protected readonly mealTypes = MEAL_TYPES;
  protected readonly mealLabels = MEAL_TYPE_LABELS;

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    objective: ['', [Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(1000)]],
    startDate: [todayIso(), [Validators.required, isoDateValidator]],
    endDate: ['', [isoDateValidator]],
    notes: ['', [Validators.maxLength(2000)]],
    active: [true],
    meals: this.fb.array<MealGroup>([]),
  });

  constructor() {
    effect(() => {
      const plan = this.plan();
      this.meals.clear();
      if (plan) {
        this.form.patchValue({
          title: plan.title,
          objective: plan.objective,
          description: plan.description,
          startDate: plan.startDate,
          endDate: plan.endDate,
          notes: plan.notes,
          active: plan.active,
        });
        plan.meals.forEach((meal) => this.meals.push(this.mealGroup(meal)));
      } else {
        this.form.reset({ startDate: todayIso(), active: true });
        DEFAULT_MEALS.forEach((type) =>
          this.meals.push(
            this.mealGroup({ id: newId(), type, name: '', description: '', foods: [], notes: '' }),
          ),
        );
      }
    });
  }

  protected get meals(): FormArray<MealGroup> {
    return this.form.controls.meals;
  }

  protected foodsOf(meal: MealGroup): FormArray<FoodGroup> {
    return meal.controls.foods;
  }

  protected error(
    control: 'title' | 'objective' | 'description' | 'startDate' | 'endDate' | 'notes',
  ): string {
    return controlError(this.form.controls[control]);
  }

  protected fieldError(group: FormGroup, control: string): string {
    const c = group.get(control);
    return c ? controlError(c) : '';
  }

  protected addMeal(): void {
    this.meals.push(
      this.mealGroup({
        id: newId(),
        type: 'other',
        name: '',
        description: '',
        foods: [],
        notes: '',
      }),
    );
  }

  protected removeMeal(index: number): void {
    this.meals.removeAt(index);
  }

  protected addFood(meal: MealGroup): void {
    meal.controls.foods.push(this.foodGroup());
  }

  protected removeFood(meal: MealGroup, index: number): void {
    meal.controls.foods.removeAt(index);
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) {
      return;
    }
    const raw = this.form.getRawValue();
    this.save.emit({
      title: raw.title.trim(),
      objective: raw.objective.trim(),
      description: raw.description.trim(),
      startDate: raw.startDate,
      endDate: raw.endDate,
      notes: raw.notes.trim(),
      active: raw.active,
      meals: raw.meals.map((meal) => ({
        id: meal.id,
        type: meal.type,
        name: meal.name.trim(),
        description: meal.description.trim(),
        notes: meal.notes.trim(),
        foods: meal.foods.map((food) => ({
          name: food.name.trim(),
          quantity: food.quantity.trim(),
          notes: food.notes.trim(),
        })),
      })),
    });
  }

  protected mealGroup(meal: Meal) {
    return this.fb.nonNullable.group({
      id: [meal.id],
      type: [meal.type, [Validators.required]],
      name: [meal.name, [Validators.maxLength(80)]],
      description: [meal.description, [Validators.maxLength(300)]],
      notes: [meal.notes, [Validators.maxLength(300)]],
      foods: this.fb.array(meal.foods.map((food) => this.foodGroup(food))),
    });
  }

  protected foodGroup(food?: FoodItem) {
    return this.fb.nonNullable.group({
      name: [food?.name ?? '', [Validators.required, Validators.maxLength(120)]],
      quantity: [food?.quantity ?? '', [Validators.maxLength(60)]],
      notes: [food?.notes ?? '', [Validators.maxLength(200)]],
    });
  }
}

function newId(): string {
  return crypto.randomUUID().slice(0, 8);
}
