import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '@core/auth/auth.service';
import { NutritionPlansService } from '@core/services/nutrition-plans.service';
import { Card } from '@shared/components/card/card';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { LoadingState } from '@shared/components/loading-state/loading-state';
import { NutritionPlanView } from '@shared/components/nutrition-plan-view/nutrition-plan-view';
import { PageHeader } from '@shared/components/page-header/page-header';

@Component({
  selector: 'app-nutrition-page',
  imports: [PageHeader, Card, LoadingState, ErrorState, EmptyState, NutritionPlanView],
  template: `
    <app-page-header
      eyebrow="Nutrición"
      title="Tu plan de alimentación"
      subtitle="Comidas y cantidades sugeridas para tu objetivo."
    />

    @if (plans.isLoading()) {
      <app-loading-state message="Cargando tu plan…" />
    } @else if (plans.error()) {
      <app-error-state title="No pudimos cargar tu plan" (retry)="plans.reload()" />
    } @else if (active(); as plan) {
      <app-card class="mb-6">
        <app-nutrition-plan-view [plan]="plan" />
      </app-card>
    } @else {
      <app-empty-state
        icon="salad"
        title="Todavía no tenés un plan activo"
        description="Tu coach va a cargar tu plan de nutrición próximamente."
      />
    }

    @if (previous().length) {
      <details class="history">
        <summary class="history__summary">Planes anteriores ({{ previous().length }})</summary>
        <div class="history__list">
          @for (plan of previous(); track plan.id) {
            <app-card>
              <app-nutrition-plan-view [plan]="plan" />
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
export class NutritionPage {
  private readonly authService = inject(AuthService);
  private readonly nutritionPlansService = inject(NutritionPlansService);

  protected readonly plans = rxResource({
    params: () => this.authService.user()?.uid,
    stream: ({ params }) => this.nutritionPlansService.list$(params),
  });

  protected readonly active = computed(() =>
    this.plans.hasValue() ? (this.plans.value().find((p) => p.active) ?? null) : null,
  );

  protected readonly previous = computed(() =>
    this.plans.hasValue() ? this.plans.value().filter((p) => !p.active) : [],
  );
}
