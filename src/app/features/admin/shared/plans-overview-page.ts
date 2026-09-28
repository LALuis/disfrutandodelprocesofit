import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { UsersService } from '@core/services/users.service';
import { Badge } from '@shared/components/badge/badge';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { Icon } from '@shared/components/icon/icon';
import { LoadingState } from '@shared/components/loading-state/loading-state';
import { PageHeader } from '@shared/components/page-header/page-header';
import { UserAvatar } from '@shared/components/user-avatar/user-avatar';
import { fullName, UserProfile } from '@shared/models/user-profile';

export type PlanKind = 'training' | 'nutrition';

const CONFIG: Record<
  PlanKind,
  {
    title: string;
    subtitle: string;
    tab: string;
    pointer: keyof UserProfile;
    requiresFeature: boolean;
  }
> = {
  training: {
    title: 'Planes de entrenamiento',
    subtitle:
      'Estado de la ficha de cada alumno activo. Los planes se editan desde la ficha del alumno.',
    tab: 'entrenamiento',
    pointer: 'activeTrainingPlanId',
    requiresFeature: false,
  },
  nutrition: {
    title: 'Planes de nutrición',
    subtitle:
      'Solo los alumnos con nutrición habilitada ven su plan. Se editan desde la ficha del alumno.',
    tab: 'nutricion',
    pointer: 'activeNutritionPlanId',
    requiresFeature: true,
  },
};

/** Overview of which active students have an active training/nutrition plan. */
@Component({
  selector: 'app-plans-overview-page',
  imports: [RouterLink, PageHeader, Badge, Icon, UserAvatar, LoadingState, ErrorState, EmptyState],
  templateUrl: './plans-overview-page.html',
  styleUrl: './plans-overview-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlansOverviewPage {
  private readonly usersService = inject(UsersService);

  /** Provided through route data. */
  readonly kind = input.required<PlanKind>();

  protected readonly config = computed(() => CONFIG[this.kind()]);
  protected readonly filter = signal<'all' | 'without'>('all');
  protected readonly students = rxResource({ stream: () => this.usersService.activeStudents$ });
  protected readonly fullName = fullName;

  protected readonly rows = computed(() => {
    const config = this.config();
    const all = this.students.hasValue() ? this.students.value() : [];
    return all
      .map((student) => ({
        student,
        hasPlan: student[config.pointer] !== null,
        featureOff: config.requiresFeature && !student.features.nutritionEnabled,
      }))
      .filter((row) => this.filter() === 'all' || !row.hasPlan);
  });

  protected onFilter(event: Event): void {
    this.filter.set((event.target as HTMLSelectElement).value as 'all' | 'without');
  }
}
