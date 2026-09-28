import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SlotGenerationInput } from '@core/services/schedule.service';
import { Button } from '@shared/components/button/button';
import { FormField } from '@shared/components/form-field/form-field';
import { addDays, isTime, todayIso, WEEKDAY_LABELS } from '@shared/utilities/dates';
import { controlError, isoDateValidator } from '@shared/utilities/validators';

/** Bulk slot creation: date range × weekdays × start times, with one capacity. */
@Component({
  selector: 'app-slot-generator-form',
  imports: [ReactiveFormsModule, Button, FormField],
  templateUrl: './slot-generator-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlotGeneratorForm {
  private readonly fb = inject(FormBuilder);

  readonly submitting = input(false);
  readonly generate = output<SlotGenerationInput>();

  protected readonly weekdays = [1, 2, 3, 4, 5, 6, 0].map((day) => ({
    value: day,
    key: String(day),
    label: WEEKDAY_LABELS[day],
  }));

  protected readonly form = this.fb.nonNullable.group({
    fromDate: [todayIso(), [Validators.required, isoDateValidator]],
    toDate: [addDays(todayIso(), 27), [Validators.required, isoDateValidator]],
    weekdays: this.fb.nonNullable.group(
      Object.fromEntries(this.weekdays.map((d) => [d.key, d.value !== 0])),
    ),
    times: ['08:00, 09:00, 10:00, 18:00, 19:00, 20:00', [Validators.required, timesValidator]],
    capacity: [10, [Validators.required, Validators.min(1), Validators.max(200)]],
    durationMinutes: [60, [Validators.required, Validators.min(15), Validators.max(240)]],
  });

  protected error(
    control: 'fromDate' | 'toDate' | 'times' | 'capacity' | 'durationMinutes',
  ): string {
    const c = this.form.controls[control];
    if (c.touched && c.hasError('times')) {
      return 'Ingresá horas válidas separadas por coma, por ejemplo 08:00, 09:30.';
    }
    return controlError(c);
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    const raw = this.form.getRawValue();
    if (this.form.invalid || this.submitting()) {
      return;
    }
    if (raw.toDate < raw.fromDate) {
      this.form.controls.toDate.setErrors({ dateOrder: true });
      return;
    }
    const weekdays = Object.entries(raw.weekdays)
      .filter(([, checked]) => checked)
      .map(([day]) => Number(day));
    this.generate.emit({
      fromDate: raw.fromDate,
      toDate: raw.toDate,
      weekdays,
      times: parseTimes(raw.times),
      capacity: raw.capacity,
      durationMinutes: raw.durationMinutes,
    });
  }
}

export function parseTimes(value: string): string[] {
  return [
    ...new Set(
      value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  ].sort();
}

function timesValidator(control: { value: string }): { times: true } | null {
  const times = parseTimes(control.value);
  return times.length > 0 && times.every(isTime) ? null : { times: true };
}
