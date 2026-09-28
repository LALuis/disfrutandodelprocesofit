import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '@core/auth/auth.service';
import { MeasurementsService } from '@core/services/measurements.service';
import { Card } from '@shared/components/card/card';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { ChartPoint, LineChart } from '@shared/components/line-chart/line-chart';
import { LoadingState } from '@shared/components/loading-state/loading-state';
import { PageHeader } from '@shared/components/page-header/page-header';
import { StatCard } from '@shared/components/stat-card/stat-card';
import {
  compareMetric,
  Measurement,
  MeasurementMetric,
  METRIC_META,
  MetricComparison,
} from '@shared/models/measurement';
import { formatDateShort } from '@shared/utilities/dates';

const CHART_METRICS: readonly MeasurementMetric[] = ['weight', 'bodyFatPercentage', 'muscleMass'];

interface MetricSeries {
  readonly metric: MeasurementMetric;
  readonly comparison: MetricComparison;
  readonly points: ChartPoint[];
}

/** Builds chart series (oldest first) for the metrics that have at least one value. */
export function buildSeries(sortedDesc: readonly Measurement[]): MetricSeries[] {
  return CHART_METRICS.map((metric) => ({
    metric,
    comparison: compareMetric(sortedDesc, metric),
    points: [...sortedDesc]
      .reverse()
      .filter((m) => m[metric] !== null)
      .map((m) => ({ label: formatDateShort(m.date), value: m[metric] as number })),
  })).filter((series) => series.points.length > 0);
}

@Component({
  selector: 'app-progress-page',
  imports: [PageHeader, Card, StatCard, LineChart, LoadingState, ErrorState, EmptyState],
  templateUrl: './progress-page.html',
  styleUrl: './progress-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressPage {
  private readonly authService = inject(AuthService);
  private readonly measurementsService = inject(MeasurementsService);

  protected readonly meta = METRIC_META;

  protected readonly history = rxResource({
    params: () => this.authService.user()?.uid,
    stream: ({ params }) => this.measurementsService.history$(params),
  });

  protected readonly series = computed(() =>
    buildSeries(this.history.hasValue() ? this.history.value() : []),
  );

  protected changeTone(
    change: number | null,
    metric: MeasurementMetric,
  ): 'default' | 'success' | 'accent' {
    if (change === null || change === 0) {
      return 'default';
    }
    // Losing weight / fat reads as progress; gaining muscle reads as progress.
    const positiveIsGood = metric === 'muscleMass';
    return change > 0 === positiveIsGood ? 'success' : 'accent';
  }

  protected signed(value: number | null): string {
    if (value === null) {
      return '–';
    }
    return `${value > 0 ? '+' : ''}${value}`;
  }
}
