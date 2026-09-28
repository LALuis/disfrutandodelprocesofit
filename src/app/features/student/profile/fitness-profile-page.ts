import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { CurrentUserService } from '@core/auth/current-user.service';
import { MeasurementsService } from '@core/services/measurements.service';
import { Button } from '@shared/components/button/button';
import { Card } from '@shared/components/card/card';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { LoadingState } from '@shared/components/loading-state/loading-state';
import { MeasurementHistory } from '@shared/components/measurement-history/measurement-history';
import { PageHeader } from '@shared/components/page-header/page-header';
import { MEASUREMENT_METRICS, METRIC_META } from '@shared/models/measurement';
import { fullName } from '@shared/models/user-profile';
import { formatDateShort } from '@shared/utilities/dates';

/** "Mi ficha": personal data, latest measurement snapshot and the full history. */
@Component({
  selector: 'app-fitness-profile-page',
  imports: [
    RouterLink,
    PageHeader,
    Card,
    Button,
    LoadingState,
    ErrorState,
    EmptyState,
    MeasurementHistory,
  ],
  templateUrl: './fitness-profile-page.html',
  styleUrl: './fitness-profile-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FitnessProfilePage {
  private readonly authService = inject(AuthService);
  private readonly measurementsService = inject(MeasurementsService);

  protected readonly profile = inject(CurrentUserService).profile;
  protected readonly metrics = MEASUREMENT_METRICS;
  protected readonly meta = METRIC_META;
  protected readonly fullName = fullName;
  protected readonly formatDate = formatDateShort;

  protected readonly history = rxResource({
    params: () => this.authService.user()?.uid,
    stream: ({ params }) => this.measurementsService.history$(params),
  });

  protected readonly latest = computed(() =>
    this.history.hasValue() ? (this.history.value()[0] ?? null) : null,
  );

  protected readonly latestMetrics = computed(() => {
    const latest = this.latest();
    return latest ? MEASUREMENT_METRICS.filter((metric) => latest[metric] !== null) : [];
  });
}
