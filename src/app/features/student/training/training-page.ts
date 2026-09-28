import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '@core/auth/auth.service';
import { TrainingPlansService } from '@core/services/training-plans.service';
import { Card } from '@shared/components/card/card';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { LoadingState } from '@shared/components/loading-state/loading-state';
import { PageHeader } from '@shared/components/page-header/page-header';
import { TrainingPlanView } from '@shared/components/training-plan-view/training-plan-view';
import { formatDateShort } from '@shared/utilities/dates';

@Component({
  selector: 'app-training-page',
  imports: [PageHeader, Card, LoadingState, ErrorState, EmptyState, TrainingPlanView],
  template: `
    <app-page-header
      eyebrow="Entrenamiento"
      title="Tu plan de entrenamiento"
      subtitle="Seguí la ficha que armó tu coach."
    />

    @if (plans.isLoading()) {
      <app-loading-state message="Cargando tu plan…" />
    } @else if (plans.error()) {
      <app-error-state title="No pudimos cargar tu plan" (retry)="plans.reload()" />
    } @else if (active(); as plan) {
      <app-card class="mb-6">
        <app-training-plan-view [plan]="plan" />
      </app-card>
    } @else {
      <app-empty-state
        icon="dumbbell"
        title="Todavía no tenés un plan activo"
        description="Tu coach va a cargar tu ficha después de la evaluación inicial."
      />
    }

    @if (previous().length) {
      <details class="history">
        <summary class="history__summary">Planes anteriores ({{ previous().length }})</summary>
        <div class="history__list">
          @for (plan of previous(); track plan.id) {
            <app-card>
              <app-training-plan-view [plan]="plan" />
            </app-card>
          }
        </div>
      </details>
    }
  `,
  styles: `
    .history__summary {
      cursor: pointer;
      color: var(--color-accent);
      font-weight: var(--weight-medium);
      margin-bottom: var(--space-3);
    }

    .history__list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingPage {
  private readonly authService = inject(AuthService);
  private readonly trainingPlansService = inject(TrainingPlansService);

  protected readonly formatDate = formatDateShort;
  protected readonly plans = rxResource({
    params: () => this.authService.user()?.uid,
    stream: ({ params }) => this.trainingPlansService.list$(params),
  });

  protected readonly active = computed(() =>
    this.plans.hasValue() ? (this.plans.value().find((p) => p.active) ?? null) : null,
  );

  protected readonly previous = computed(() =>
    this.plans.hasValue() ? this.plans.value().filter((p) => !p.active) : [],
  );
}
