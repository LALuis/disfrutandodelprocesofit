import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { UsersService } from '@core/services/users.service';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { Icon } from '@shared/components/icon/icon';
import { LoadingState } from '@shared/components/loading-state/loading-state';
import { PageHeader } from '@shared/components/page-header/page-header';
import { UserAvatar } from '@shared/components/user-avatar/user-avatar';
import { fullName, UserProfile } from '@shared/models/user-profile';

type StatusFilter = 'all' | 'active' | 'inactive';

export function filterStudents(
  students: readonly UserProfile[],
  term: string,
  status: StatusFilter,
): UserProfile[] {
  const needle = term.trim().toLowerCase();
  return students.filter((s) => {
    if (status === 'active' && !s.active) {
      return false;
    }
    if (status === 'inactive' && s.active) {
      return false;
    }
    return needle === '' || `${fullName(s)} ${s.email} ${s.phone}`.toLowerCase().includes(needle);
  });
}

@Component({
  selector: 'app-students-page',
  imports: [
    RouterLink,
    PageHeader,
    Button,
    Icon,
    Badge,
    UserAvatar,
    LoadingState,
    ErrorState,
    EmptyState,
  ],
  templateUrl: './students-page.html',
  styleUrl: './students-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentsPage {
  private readonly usersService = inject(UsersService);

  protected readonly search = signal('');
  protected readonly status = signal<StatusFilter>('all');
  protected readonly students = rxResource({ stream: () => this.usersService.students$ });

  protected readonly filtered = computed(() =>
    filterStudents(
      this.students.hasValue() ? this.students.value() : [],
      this.search(),
      this.status(),
    ),
  );

  protected readonly fullName = fullName;

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected onStatus(event: Event): void {
    this.status.set((event.target as HTMLSelectElement).value as StatusFilter);
  }
}
