import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MEAL_TYPE_LABELS, NutritionPlan } from '@shared/models/nutrition-plan';
import { formatDateShort } from '@shared/utilities/dates';
import { Badge } from '../badge/badge';

/** Read-only rendering of a nutrition plan: meals with their foods. */
@Component({
  selector: 'app-nutrition-plan-view',
  imports: [Badge],
  templateUrl: './nutrition-plan-view.html',
  styleUrl: './nutrition-plan-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NutritionPlanView {
  readonly plan = input.required<NutritionPlan>();
  readonly showHeader = input(true);

  protected readonly mealLabels = MEAL_TYPE_LABELS;
  protected readonly formatDate = formatDateShort;
}
