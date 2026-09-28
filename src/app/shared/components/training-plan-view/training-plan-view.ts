import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TrainingPlan } from '@shared/models/training-plan';
import { formatDateShort } from '@shared/utilities/dates';
import { Badge } from '../badge/badge';

/** Read-only rendering of a training plan: days with their exercise tables. */
@Component({
  selector: 'app-training-plan-view',
  imports: [Badge],
  templateUrl: './training-plan-view.html',
  styleUrl: './training-plan-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingPlanView {
  readonly plan = input.required<TrainingPlan>();
  readonly showHeader = input(true);

  protected readonly formatDate = formatDateShort;
}
