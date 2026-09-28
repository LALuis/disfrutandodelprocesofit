import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DashboardStatsService } from '@core/services/dashboard-stats.service';
import { Button } from '@shared/components/button/button';
import { ErrorState } from '@shared/components/error-state/error-state';
import { Icon } from '@shared/components/icon/icon';
import { LoadingState } from '@shared/components/loading-state/loading-state';
import { PageHeader } from '@shared/components/page-header/page-header';
import { StatCard } from '@shared/components/stat-card/stat-card';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [RouterLink, PageHeader, StatCard, Button, Icon, LoadingState, ErrorState],
  templateUrl: './admin-dashboard-page.html',
  styleUrl: './admin-dashboard-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardPage {
  private readonly statsService = inject(DashboardStatsService);

  protected readonly stats = rxResource({ stream: () => this.statsService.stats$() });
}
