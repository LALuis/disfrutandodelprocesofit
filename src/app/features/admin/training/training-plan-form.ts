import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@shared/components/button/button';
import { FormField } from '@shared/components/form-field/form-field';
import { Icon } from '@shared/components/icon/icon';
import {
  Exercise,
  TrainingPlan,
  TrainingPlanInput,
  WorkoutDay,
} from '@shared/models/training-plan';
import { todayIso } from '@shared/utilities/dates';
import { controlError, isoDateValidator } from '@shared/utilities/validators';

type ExerciseGroup = ReturnType<TrainingPlanForm['exerciseGroup']>;
type DayGroup = ReturnType<TrainingPlanForm['dayGroup']>;

/** Nested reactive form: plan → days → exercises. Emits a normalised `TrainingPlanInput`. */
@Component({
  selector: 'app-training-plan-form',
  imports: [ReactiveFormsModule, Button, FormField, Icon],
  templateUrl: './training-plan-form.html',
  styleUrl: './training-plan-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingPlanForm {
  private readonly fb = inject(FormBuilder);

  readonly plan = input<TrainingPlan | null>(null);
  readonly submitting = input(false);
  readonly save = output<TrainingPlanInput>();
  readonly cancelled = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.maxLength(1000)]],
    startDate: [todayIso(), [Validators.required, isoDateValidator]],
    endDate: ['', [isoDateValidator]],
    active: [true],
    days: this.fb.array<DayGroup>([]),
  });

  constructor() {
    effect(() => {
      const plan = this.plan();
      this.form.controls.days.clear();
      if (plan) {
        this.form.patchValue({
          name: plan.name,
          description: plan.description,
          startDate: plan.startDate,
          endDate: plan.endDate,
          active: plan.active,
        });
        plan.days.forEach((day) => this.form.controls.days.push(this.dayGroup(day)));
      } else {
        this.form.reset({ startDate: todayIso(), active: true });
        this.form.controls.days.push(
          this.dayGroup({ id: newId(), name: 'Día A', focus: '', exercises: [] }),
        );
      }
    });
  }

  protected get days(): FormArray<DayGroup> {
    return this.form.controls.days;
  }

  protected exercisesOf(day: DayGroup): FormArray<ExerciseGroup> {
    return day.controls.exercises;
  }

  protected error(control: 'name' | 'description' | 'startDate' | 'endDate'): string {
    return controlError(this.form.controls[control]);
  }

  protected fieldError(group: FormGroup, control: string): string {
    const c = group.get(control);
    return c ? controlError(c) : '';
  }

  protected addDay(): void {
    const letter = String.fromCharCode(65 + (this.days.length % 26));
    this.days.push(this.dayGroup({ id: newId(), name: `Día ${letter}`, focus: '', exercises: [] }));
  }

  protected removeDay(index: number): void {
    this.days.removeAt(index);
  }

  protected addExercise(day: DayGroup): void {
    day.controls.exercises.push(this.exerciseGroup());
  }

  protected removeExercise(day: DayGroup, index: number): void {
    day.controls.exercises.removeAt(index);
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) {
      return;
    }
    const raw = this.form.getRawValue();
    this.save.emit({
      name: raw.name.trim(),
      description: raw.description.trim(),
      startDate: raw.startDate,
      endDate: raw.endDate,
      active: raw.active,
      days: raw.days.map((day) => ({
        id: day.id,
        name: day.name.trim(),
        focus: day.focus.trim(),
        exercises: day.exercises.map((e) => ({
          name: e.name.trim(),
          sets: e.sets,
          reps: e.reps.trim(),
          rest: e.rest.trim(),
          notes: e.notes.trim(),
          targetWeight: e.targetWeight.trim(),
        })),
      })),
    });
  }

  protected dayGroup(day: WorkoutDay) {
    return this.fb.nonNullable.group({
      id: [day.id],
      name: [day.name, [Validators.required, Validators.maxLength(60)]],
      focus: [day.focus, [Validators.maxLength(120)]],
      exercises: this.fb.array(day.exercises.map((e) => this.exerciseGroup(e))),
    });
  }

  protected exerciseGroup(exercise?: Exercise) {
    return this.fb.nonNullable.group({
      name: [exercise?.name ?? '', [Validators.required, Validators.maxLength(120)]],
      sets: [exercise?.sets ?? 3, [Validators.required, Validators.min(1), Validators.max(50)]],
      reps: [exercise?.reps ?? '10', [Validators.required, Validators.maxLength(30)]],
      rest: [exercise?.rest ?? '', [Validators.maxLength(30)]],
      targetWeight: [exercise?.targetWeight ?? '', [Validators.maxLength(30)]],
      notes: [exercise?.notes ?? '', [Validators.maxLength(300)]],
    });
  }
}

function newId(): string {
  return crypto.randomUUID().slice(0, 8);
}
