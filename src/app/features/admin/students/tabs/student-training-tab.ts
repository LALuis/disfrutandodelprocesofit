import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TrainingPlansService } from '@core/services/training-plans.service';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { Card } from '@shared/components/card/card';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { Icon } from '@shared/components/icon/icon';
import { LoadingState } from '@shared/components/loading-state/loading-state';
import { TrainingPlanView } from '@shared/components/training-plan-view/training-plan-view';
import { TrainingPlan } from '@shared/models/training-plan';
import { formatDateShort } from '@shared/utilities/dates';
import { PlansTabBase } from '../../shared/plans-tab-base';
import { TrainingPlanForm } from '../../training/training-plan-form';

@Component({
  selector: 'app-student-training-tab',
  imports: [
    Card,
    Button,
    Icon,
    Badge,
    LoadingState,
    ErrorState,
    EmptyState,
    TrainingPlanForm,
    TrainingPlanView,
  ],
  templateUrl: './student-training-tab.html',
  styleUrl: './student-plans-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentTrainingTab extends PlansTabBase<TrainingPlan> {
  protected readonly store = inject(TrainingPlansService);
  protected readonly planLabel = 'Plan de entrenamiento';
  protected readonly formatDate = formatDateShort;
}
