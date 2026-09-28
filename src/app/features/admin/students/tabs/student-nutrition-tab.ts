import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NutritionPlansService } from '@core/services/nutrition-plans.service';
import { UsersService } from '@core/services/users.service';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { Card } from '@shared/components/card/card';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { Icon } from '@shared/components/icon/icon';
import { LoadingState } from '@shared/components/loading-state/loading-state';
import { NutritionPlanView } from '@shared/components/nutrition-plan-view/nutrition-plan-view';
import { NutritionPlan } from '@shared/models/nutrition-plan';
import { formatDateShort } from '@shared/utilities/dates';
import { PlansTabBase } from '../../shared/plans-tab-base';
import { NutritionPlanForm } from '../../nutrition/nutrition-plan-form';

@Component({
  selector: 'app-student-nutrition-tab',
  imports: [
    Card,
    Button,
    Icon,
    Badge,
    LoadingState,
    ErrorState,
    EmptyState,
    NutritionPlanForm,
    NutritionPlanView,
  ],
  templateUrl: './student-nutrition-tab.html',
  styleUrl: './student-plans-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentNutritionTab extends PlansTabBase<NutritionPlan> {
  private readonly usersService = inject(UsersService);

  protected readonly store = inject(NutritionPlansService);
  protected readonly planLabel = 'Plan de nutrición';
  protected readonly formatDate = formatDateShort;

  /** Warn when the student cannot see nutrition plans because the feature is off. */
  protected readonly profile = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.usersService.profile$(params),
  });
}
