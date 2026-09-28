import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { messageFromError } from '@core/firebase/firebase-error';
import { ScheduleService, SlotGenerationInput } from '@core/services/schedule.service';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { Card } from '@shared/components/card/card';
import { DateNav } from '@shared/components/date-nav/date-nav';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { FormField } from '@shared/components/form-field/form-field';
import { Icon } from '@shared/components/icon/icon';
import { LoadingState } from '@shared/components/loading-state/loading-state';
import { PageHeader } from '@shared/components/page-header/page-header';
import { isSlotPast, remainingCapacity, ScheduleSlot } from '@shared/models/schedule';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { ToastService } from '@shared/services/toast.service';
import { todayIso } from '@shared/utilities/dates';
import { controlError, timeValidator } from '@shared/utilities/validators';
import { SlotGeneratorForm } from './slot-generator-form';

/** Admin schedule: bulk generation plus per-day slot management. */
@Component({
  selector: 'app-schedule-page',
  imports: [
    ReactiveFormsModule,
    PageHeader,
    Card,
    Button,
    Icon,
    Badge,
    DateNav,
    FormField,
    LoadingState,
    ErrorState,
    EmptyState,
    SlotGeneratorForm,
  ],
  templateUrl: './schedule-page.html',
  styleUrl: './schedule-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulePage {
  private readonly fb = inject(FormBuilder);
  private readonly scheduleService = inject(ScheduleService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  protected readonly date = signal(todayIso());
  protected readonly generatorOpen = signal(false);
  protected readonly generating = signal(false);
  protected readonly adding = signal(false);
  protected readonly busySlotId = signal<string | null>(null);

  protected readonly slots = rxResource({
    params: () => this.date(),
    stream: ({ params }) => this.scheduleService.slotsForDate$(params),
  });

  protected readonly addForm = this.fb.nonNullable.group({
    startTime: ['', [Validators.required, timeValidator]],
    capacity: [10, [Validators.required, Validators.min(1), Validators.max(200)]],
    durationMinutes: [60, [Validators.required, Validators.min(15), Validators.max(240)]],
  });

  protected readonly remaining = remainingCapacity;
  protected readonly isPast = (slot: ScheduleSlot) => isSlotPast(slot);

  protected addError(control: 'startTime' | 'capacity' | 'durationMinutes'): string {
    return controlError(this.addForm.controls[control]);
  }

  protected async generate(input: SlotGenerationInput): Promise<void> {
    this.generating.set(true);
    try {
      const result = await this.scheduleService.generate(input);
      this.toast.success(
        `Horarios generados: ${result.created} nuevos, ${result.updated} actualizados.`,
      );
      this.generatorOpen.set(false);
      this.date.set(input.fromDate);
    } catch (error) {
      this.toast.error(messageFromError(error));
    } finally {
      this.generating.set(false);
    }
  }

  protected async addSlot(): Promise<void> {
    this.addForm.markAllAsTouched();
    if (this.addForm.invalid || this.adding()) {
      return;
    }
    const raw = this.addForm.getRawValue();
    this.adding.set(true);
    try {
      await this.scheduleService.create({ date: this.date(), enabled: true, ...raw });
      this.addForm.reset({
        startTime: '',
        capacity: raw.capacity,
        durationMinutes: raw.durationMinutes,
      });
      this.toast.success('Horario creado.');
    } catch (error) {
      this.toast.error(messageFromError(error));
    } finally {
      this.adding.set(false);
    }
  }

  protected async toggleEnabled(slot: ScheduleSlot): Promise<void> {
    await this.run(slot, () => this.scheduleService.update(slot.id, { enabled: !slot.enabled }));
  }

  protected async changeCapacity(slot: ScheduleSlot, event: Event): Promise<void> {
    const capacity = Number((event.target as HTMLInputElement).value);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity === slot.capacity) {
      return;
    }
    await this.run(slot, () => this.scheduleService.update(slot.id, { capacity }));
  }

  protected async remove(slot: ScheduleSlot): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Eliminar horario',
      message: `Se va a eliminar el turno de las ${slot.startTime}. Solo es posible cuando no tiene reservas.`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (ok) {
      await this.run(slot, () => this.scheduleService.remove(slot.id), 'Horario eliminado.');
    }
  }

  private async run(
    slot: ScheduleSlot,
    action: () => Promise<void>,
    successMessage?: string,
  ): Promise<void> {
    this.busySlotId.set(slot.id);
    try {
      await action();
      if (successMessage) {
        this.toast.success(successMessage);
      }
    } catch (error) {
      this.toast.error(messageFromError(error));
    } finally {
      this.busySlotId.set(null);
    }
  }
}
