import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateStudentInput } from '@core/services/users.service';
import { Button } from '@shared/components/button/button';
import { FormField } from '@shared/components/form-field/form-field';
import { FEATURE_KEYS, FEATURE_LABELS, UserProfile } from '@shared/models/user-profile';
import { todayIso } from '@shared/utilities/dates';
import { controlError, isoDateValidator } from '@shared/utilities/validators';

export type StudentFormValue = CreateStudentInput;
type TextControl =
  'firstName' | 'lastName' | 'email' | 'phone' | 'birthDate' | 'joinDate' | 'notes';

/** Create/edit form for a student profile. Email is immutable once the account exists. */
@Component({
  selector: 'app-student-form',
  imports: [ReactiveFormsModule, Button, FormField],
  templateUrl: './student-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentForm {
  private readonly fb = inject(FormBuilder);

  /** Existing profile to edit; omit for creation. */
  readonly profile = input<UserProfile | null>(null);
  readonly submitting = input(false);
  readonly submitLabel = input('Guardar');
  readonly save = output<StudentFormValue>();

  protected readonly featureKeys = FEATURE_KEYS;
  protected readonly featureLabels = FEATURE_LABELS;
  protected readonly isEdit = computed(() => this.profile() !== null);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(80)]],
    lastName: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.maxLength(40)]],
    birthDate: ['', [isoDateValidator]],
    joinDate: [todayIso(), [Validators.required, isoDateValidator]],
    notes: ['', [Validators.maxLength(2000)]],
    features: this.fb.nonNullable.group({
      nutritionEnabled: [false],
      recipesEnabled: [false],
    }),
  });

  constructor() {
    effect(() => {
      const profile = this.profile();
      if (profile) {
        this.form.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          birthDate: profile.birthDate,
          joinDate: profile.joinDate || todayIso(),
          notes: profile.notes,
          features: { ...profile.features },
        });
        this.form.controls.email.disable();
      }
    });
  }

  protected error(control: TextControl): string {
    return controlError(this.form.controls[control]);
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) {
      return;
    }
    const value = this.form.getRawValue();
    this.save.emit({
      ...value,
      email: value.email.trim().toLowerCase(),
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      phone: value.phone.trim(),
      notes: value.notes.trim(),
    });
  }
}
