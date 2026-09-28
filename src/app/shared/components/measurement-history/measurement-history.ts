import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Measurement, MEASUREMENT_METRICS, METRIC_META } from '@shared/models/measurement';
import { formatDateShort } from '@shared/utilities/dates';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';

/** Table of historical measurements (newest first). Emits `remove` when deletion is allowed. */
@Component({
  selector: 'app-measurement-history',
  imports: [Button, Icon],
  templateUrl: './measurement-history.html',
  styleUrl: './measurement-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeasurementHistory {
  readonly measurements = input.required<readonly Measurement[]>();
  readonly canDelete = input(false);
  readonly remove = output<Measurement>();

  protected readonly metrics = MEASUREMENT_METRICS;
  protected readonly meta = METRIC_META;
  protected readonly formatDate = formatDateShort;
}
