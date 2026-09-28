import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { CurrentUserService } from '@core/auth/current-user.service';
import { BookingsService } from '@core/services/bookings.service';
import { MeasurementsService } from '@core/services/measurements.service';
import { TrainingPlansService } from '@core/services/training-plans.service';
import { Badge } from '@shared/components/badge/badge';
import { BookingList } from '@shared/components/booking-list/booking-list';
import { Button } from '@shared/components/button/button';
import { Card } from '@shared/components/card/card';
import { Icon } from '@shared/components/icon/icon';
import { PageHeader } from '@shared/components/page-header/page-header';
import { StatCard } from '@shared/components/stat-card/stat-card';
import { compareMetric } from '@shared/models/measurement';
import { formatDateLong } from '@shared/utilities/dates';

const UPCOMING_LIMIT = 3;

@Component({
  selector: 'app-student-dashboard-page',
  imports: [RouterLink, PageHeader, Card, StatCard, Badge, Button, Icon, BookingList],
  templateUrl: './student-dashboard-page.html',
  styleUrl: './student-dashboard-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDashboardPage {
  private readonly authService = inject(AuthService);
  private readonly currentUser = inject(CurrentUserService);
  private readonly bookingsService = inject(BookingsService);
  private readonly measurementsService = inject(MeasurementsService);
  private readonly trainingPlansService = inject(TrainingPlansService);

  /** `undefined` keeps the resources idle until the session is known (never inside the portal). */
  private readonly uid = computed(() => this.authService.user()?.uid);

  protected readonly profile = this.currentUser.profile;
  protected readonly formatDate = formatDateLong;

  protected readonly greeting = computed(() => {
    const name = this.profile()?.firstName || this.authService.user()?.displayName;
    return name ? `Hola, ${name}` : 'Hola';
  });

  protected readonly bookings = rxResource({
    params: () => this.uid(),
    stream: ({ params }) => this.bookingsService.myBookings$(params),
  });

  protected readonly measurements = rxResource({
    params: () => this.uid(),
    stream: ({ params }) => this.measurementsService.history$(params),
  });

  protected readonly trainingPlan = rxResource({
    params: () => this.uid(),
    stream: ({ params }) => this.trainingPlansService.active$(params),
  });

  protected readonly upcoming = computed(() => {
    const now = Date.now();
    const all = this.bookings.hasValue() ? this.bookings.value() : [];
    return all
      .filter((b) => b.status === 'confirmed' && b.startsAt > now)
      .sort((a, b) => a.startsAt - b.startsAt)
      .slice(0, UPCOMING_LIMIT);
  });

  protected readonly nextBooking = computed(() => this.upcoming()[0] ?? null);

  protected readonly weight = computed(() =>
    compareMetric(this.measurements.hasValue() ? this.measurements.value() : [], 'weight'),
  );

  protected readonly measurementCount = computed(() =>
    this.measurements.hasValue() ? this.measurements.value().length : 0,
  );

  protected readonly lastMeasurementDate = computed(() =>
    this.measurements.hasValue() ? (this.measurements.value()[0]?.date ?? '') : '',
  );

  protected changeLabel(change: number | null): string {
    if (change === null) {
      return 'Sin comparación aún';
    }
    const sign = change > 0 ? '+' : '';
    return `${sign}${change} kg desde la medición anterior`;
  }
}
