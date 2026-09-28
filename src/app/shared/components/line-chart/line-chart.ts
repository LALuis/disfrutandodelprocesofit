import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface ChartPoint {
  readonly label: string;
  readonly value: number;
}

interface PlottedPoint extends ChartPoint {
  readonly x: number;
  readonly y: number;
}

const WIDTH = 600;
const HEIGHT = 220;
const PAD = { top: 16, right: 16, bottom: 32, left: 44 };

/**
 * Dependency-free SVG line chart for time series (weight, body fat…). Scales to its
 * container through the viewBox; points are ordered as given (oldest first).
 */
@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.html',
  styleUrl: './line-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChart {
  readonly points = input.required<readonly ChartPoint[]>();
  readonly unit = input('');
  readonly title = input('');

  protected readonly width = WIDTH;
  protected readonly height = HEIGHT;
  protected readonly pad = PAD;

  protected readonly domain = computed(() => {
    const values = this.points().map((p) => p.value);
    if (values.length === 0) {
      return { min: 0, max: 1 };
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const margin = max === min ? Math.max(1, Math.abs(max) * 0.1) : (max - min) * 0.15;
    return { min: min - margin, max: max + margin };
  });

  protected readonly plotted = computed<PlottedPoint[]>(() => {
    const points = this.points();
    const { min, max } = this.domain();
    const innerWidth = WIDTH - PAD.left - PAD.right;
    const innerHeight = HEIGHT - PAD.top - PAD.bottom;
    const step = points.length > 1 ? innerWidth / (points.length - 1) : 0;
    return points.map((point, index) => ({
      ...point,
      x: PAD.left + (points.length > 1 ? index * step : innerWidth / 2),
      y: PAD.top + innerHeight - ((point.value - min) / (max - min)) * innerHeight,
    }));
  });

  protected readonly path = computed(() =>
    this.plotted()
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' '),
  );

  protected readonly areaPath = computed(() => {
    const plotted = this.plotted();
    if (plotted.length < 2) {
      return '';
    }
    const baseline = HEIGHT - PAD.bottom;
    const first = plotted[0];
    const last = plotted[plotted.length - 1];
    return `${this.path()} L${last.x.toFixed(1)},${baseline} L${first.x.toFixed(1)},${baseline} Z`;
  });

  protected readonly yTicks = computed(() => {
    const { min, max } = this.domain();
    const innerHeight = HEIGHT - PAD.top - PAD.bottom;
    return [0, 0.5, 1].map((ratio) => ({
      y: PAD.top + innerHeight - ratio * innerHeight,
      label: (min + (max - min) * ratio).toFixed(1),
    }));
  });

  /** Show at most ~5 x labels to avoid overlap on mobile. */
  protected readonly xLabels = computed(() => {
    const plotted = this.plotted();
    const every = Math.max(1, Math.ceil(plotted.length / 5));
    return plotted.filter((_, i) => i % every === 0 || i === plotted.length - 1);
  });

  protected readonly description = computed(() => {
    const points = this.points();
    if (points.length === 0) {
      return 'Sin datos';
    }
    const first = points[0];
    const last = points[points.length - 1];
    return `${this.title()}: de ${first.value}${this.unit()} (${first.label}) a ${last.value}${this.unit()} (${last.label}), ${points.length} registros.`;
  });
}
