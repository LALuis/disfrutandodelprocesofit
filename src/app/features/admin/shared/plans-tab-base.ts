import { Directive, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { messageFromError } from '@core/firebase/firebase-error';
import { UserPlansStore } from '@core/services/user-plans.store';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { ToastService } from '@shared/services/toast.service';

interface PlanLike {
  readonly id: string;
  readonly active: boolean;
  readonly startDate: string;
}

/**
 * Shared behaviour of the admin "plans" tabs (training / nutrition): list, create/edit
 * through an inline form, activate, delete. Subclasses provide the store and labels.
 */
@Directive()
export abstract class PlansTabBase<T extends PlanLike> {
  private readonly confirm = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  /** Student id from the parent route. */
  readonly id = input.required<string>();

  protected abstract readonly store: UserPlansStore<T>;
  protected abstract readonly planLabel: string;

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  /** `undefined` = closed, `null` = creating, plan = editing. */
  protected readonly editing = signal<T | null | undefined>(undefined);

  protected readonly plans = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.store.list$(params),
  });

  protected nameOf(plan: T): string {
    return 'name' in plan && typeof plan.name === 'string'
      ? plan.name
      : 'title' in plan && typeof plan.title === 'string'
        ? plan.title
        : '';
  }

  protected openCreate(): void {
    this.errorMessage.set('');
    this.editing.set(null);
  }

  protected openEdit(plan: T): void {
    this.errorMessage.set('');
    this.editing.set(plan);
  }

  protected closeForm(): void {
    this.editing.set(undefined);
  }

  protected async save(input: Omit<T, 'id'>): Promise<void> {
    this.submitting.set(true);
    this.errorMessage.set('');
    try {
      await this.store.save(this.id(), input, this.editing()?.id);
      this.toast.success(`${this.planLabel} guardado.`);
      this.editing.set(undefined);
    } catch (error) {
      this.errorMessage.set(messageFromError(error));
    } finally {
      this.submitting.set(false);
    }
  }

  protected async setActive(plan: T, active: boolean): Promise<void> {
    try {
      await this.store.setActive(this.id(), plan.id, active);
      this.toast.success(active ? `${this.planLabel} activado.` : `${this.planLabel} desactivado.`);
    } catch (error) {
      this.toast.error(messageFromError(error));
    }
  }

  protected async remove(plan: T): Promise<void> {
    const ok = await this.confirm.ask({
      title: `Eliminar ${this.planLabel.toLowerCase()}`,
      message: `Se va a eliminar "${this.nameOf(plan)}" de forma permanente.`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) {
      return;
    }
    try {
      await this.store.remove(this.id(), plan.id);
      this.toast.success(`${this.planLabel} eliminado.`);
    } catch (error) {
      this.toast.error(messageFromError(error));
    }
  }
}
