import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { messageFromError } from '@core/firebase/firebase-error';
import { MembershipPlansService } from '@core/services/membership-plans.service';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { Card } from '@shared/components/card/card';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { FormField } from '@shared/components/form-field/form-field';
import { Icon } from '@shared/components/icon/icon';
import { LoadingState } from '@shared/components/loading-state/loading-state';
import { PageHeader } from '@shared/components/page-header/page-header';
import {
  MembershipPlan,
  PLAN_FREQUENCIES,
  PLAN_FREQUENCY_LABELS,
  PlanFrequency,
} from '@shared/models/membership-plan';
import { PricePipe } from '@shared/pipes/price.pipe';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { ToastService } from '@shared/services/toast.service';
import { controlError } from '@shared/utilities/validators';

/** Membership plans CRUD (the public site shows the active ones). */
@Component({
  selector: 'app-admin-plans-page',
  imports: [
    ReactiveFormsModule,
    PageHeader,
    Card,
    Button,
    Icon,
    Badge,
    FormField,
    PricePipe,
    LoadingState,
    ErrorState,
    EmptyState,
  ],
  templateUrl: './admin-plans-page.html',
  styleUrl: './admin-plans-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPlansPage {
  private readonly fb = inject(FormBuilder);
  private readonly plansService = inject(MembershipPlansService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  protected readonly frequencies = PLAN_FREQUENCIES;
  protected readonly frequencyLabels = PLAN_FREQUENCY_LABELS;
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly editing = signal<MembershipPlan | null | undefined>(undefined);

  protected readonly plans = rxResource({ stream: () => this.plansService.allPlans$ });

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.maxLength(300)]],
    price: [0, [Validators.required, Validators.min(0)]],
    currency: ['UYU', [Validators.required, Validators.maxLength(3)]],
    frequency: ['monthly' as PlanFrequency, [Validators.required]],
    features: ['', [Validators.maxLength(1000)]],
    highlighted: [false],
    active: [true],
    displayOrder: [1, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    effect(() => {
      const plan = this.editing();
      if (plan) {
        this.form.patchValue({ ...plan, features: plan.features.join('\n') });
      } else if (plan === null) {
        const count = this.plans.hasValue() ? this.plans.value().length : 0;
        this.form.reset({
          currency: 'UYU',
          frequency: 'monthly',
          active: true,
          displayOrder: count + 1,
        });
      }
    });
  }

  protected error(control: keyof AdminPlansPage['form']['controls']): string {
    return controlError(this.form.controls[control]);
  }

  protected openCreate(): void {
    this.errorMessage.set('');
    this.editing.set(null);
  }

  protected openEdit(plan: MembershipPlan): void {
    this.errorMessage.set('');
    this.editing.set(plan);
  }

  protected async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) {
      return;
    }
    const raw = this.form.getRawValue();
    this.submitting.set(true);
    this.errorMessage.set('');
    try {
      await this.plansService.save(
        {
          ...raw,
          name: raw.name.trim(),
          description: raw.description.trim(),
          currency: raw.currency.trim().toUpperCase(),
          features: raw.features
            .split('\n')
            .map((f) => f.trim())
            .filter(Boolean),
        },
        this.editing()?.id,
      );
      this.toast.success('Plan guardado.');
      this.editing.set(undefined);
    } catch (error) {
      this.errorMessage.set(messageFromError(error));
    } finally {
      this.submitting.set(false);
    }
  }

  protected async toggleActive(plan: MembershipPlan): Promise<void> {
    try {
      const { id: _id, ...data } = plan;
      await this.plansService.save({ ...data, active: !plan.active }, plan.id);
    } catch (error) {
      this.toast.error(messageFromError(error));
    }
  }

  protected async remove(plan: MembershipPlan): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Eliminar plan',
      message: `Se va a eliminar "${plan.name}". Si querés dejar de mostrarlo, alcanza con desactivarlo.`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) {
      return;
    }
    try {
      await this.plansService.remove(plan.id);
      this.toast.success('Plan eliminado.');
    } catch (error) {
      this.toast.error(messageFromError(error));
    }
  }
}
