import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { GymSettingsService } from '@core/services/gym-settings.service';
import { MembershipPlansService } from '@core/services/membership-plans.service';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { LoadingState } from '@shared/components/loading-state/loading-state';
import { PlanCard } from './plan-card';

/** Grid of active membership plans with loading / error / empty states. */
@Component({
  selector: 'app-plans-list',
  imports: [PlanCard, LoadingState, ErrorState, EmptyState],
  template: `
    @if (plans.isLoading()) {
      <app-loading-state message="Cargando planes…" />
    } @else if (plans.error()) {
      <app-error-state
        title="No pudimos cargar los planes"
        message="Probá de nuevo en unos segundos."
        (retry)="plans.reload()"
      />
    } @else if (plans.hasValue() && plans.value().length) {
      <div class="plans-grid">
        @for (plan of plans.value(); track plan.id) {
          <app-plan-card [plan]="plan" [whatsapp]="settings().whatsapp" />
        }
      </div>
    } @else {
      <app-empty-state
        icon="clipboard"
        title="Todavía no hay planes publicados"
        description="Estamos actualizando nuestras propuestas. Escribinos y te contamos las opciones."
      />
    }
  `,
  styles: `
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
      gap: var(--space-6);
      padding-top: var(--space-3);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlansList {
  private readonly plansService = inject(MembershipPlansService);

  protected readonly settings = inject(GymSettingsService).settings;
  protected readonly plans = rxResource({ stream: () => this.plansService.activePlans$ });
}
