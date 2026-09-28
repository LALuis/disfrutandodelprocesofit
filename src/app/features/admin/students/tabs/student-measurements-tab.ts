import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { messageFromError } from '@core/firebase/firebase-error';
import { MeasurementsService } from '@core/services/measurements.service';
import { Button } from '@shared/components/button/button';
import { Card } from '@shared/components/card/card';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { FormField } from '@shared/components/form-field/form-field';
import { Icon } from '@shared/components/icon/icon';
import { LoadingState } from '@shared/components/loading-state/loading-state';
import { MeasurementHistory } from '@shared/components/measurement-history/measurement-history';
import {
  Measurement,
  MEASUREMENT_METRICS,
  MeasurementInput,
  MeasurementMetric,
  METRIC_META,
} from '@shared/models/measurement';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { ToastService } from '@shared/services/toast.service';
import { formatDateShort, todayIso } from '@shared/utilities/dates';
import { controlError, isoDateValidator } from '@shared/utilities/validators';

/** Admin tab: append a measurement and browse the student's history. */
@Component({
  selector: 'app-student-measurements-tab',
  imports: [
    ReactiveFormsModule,
    Card,
    Button,
    Icon,
    FormField,
    LoadingState,
    ErrorState,
    EmptyState,
    MeasurementHistory,
  ],
  templateUrl: './student-measurements-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentMeasurementsTab {
  private readonly fb = inject(FormBuilder);
  private readonly measurementsService = inject(MeasurementsService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  readonly id = input.required<string>();

  protected readonly metrics = MEASUREMENT_METRICS;
  protected readonly meta = METRIC_META;
  protected readonly submitting = signal(false);
  protected readonly formOpen = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly history = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.measurementsService.history$(params),
  });

  private readonly metricControls = Object.fromEntries(
    MEASUREMENT_METRICS.map((metric) => [
      metric,
      new FormControl<number | null>(null, [Validators.min(0), Validators.max(999)]),
    ]),
  ) as Record<MeasurementMetric, FormControl<number | null>>;

  protected readonly form = this.fb.nonNullable.group({
    date: [todayIso(), [Validators.required, isoDateValidator]],
    notes: ['', [Validators.maxLength(1000)]],
    metrics: new FormGroup(this.metricControls),
  });

  protected error(control: 'date' | 'notes'): string {
    return controlError(this.form.controls[control]);
  }

  protected metricError(metric: MeasurementMetric): string {
    return controlError(this.metricControls[metric]);
  }

  protected async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) {
      return;
    }
    const raw = this.form.getRawValue();
    const values = Object.fromEntries(
      MEASUREMENT_METRICS.map((metric) => {
        const value = raw.metrics[metric];
        return [metric, typeof value === 'number' ? value : null];
      }),
    ) as Record<MeasurementMetric, number | null>;
    if (Object.values(values).every((v) => v === null)) {
      this.errorMessage.set('Ingresá al menos una medida.');
      return;
    }
    const input: MeasurementInput = { date: raw.date, notes: raw.notes.trim(), ...values };

    this.submitting.set(true);
    this.errorMessage.set('');
    try {
      await this.measurementsService.add(this.id(), input);
      this.form.reset({ date: todayIso(), notes: '', metrics: {} });
      this.formOpen.set(false);
      this.toast.success('Medición registrada.');
    } catch (error) {
      this.errorMessage.set(messageFromError(error));
    } finally {
      this.submitting.set(false);
    }
  }

  protected async remove(measurement: Measurement): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Eliminar medición',
      message: `Se va a eliminar la medición del ${formatDateShort(measurement.date)}. Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) {
      return;
    }
    try {
      await this.measurementsService.remove(this.id(), measurement.id);
      this.toast.success('Medición eliminada.');
    } catch (error) {
      this.toast.error(messageFromError(error));
    }
  }
}
