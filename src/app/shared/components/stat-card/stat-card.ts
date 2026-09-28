import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AppIconName } from '../icon/app-icons';
import { Icon } from '../icon/icon';

export type StatTone = 'default' | 'accent' | 'success' | 'warning' | 'error';

/** Compact metric card used on dashboards and progress screens. */
@Component({
  selector: 'app-stat-card',
  imports: [Icon],
  template: `
    <div class="stat__head">
      <span class="stat__label">{{ label() }}</span>
      @if (icon()) {
        <span class="stat__icon"><app-icon [name]="icon()!" [size]="18" /></span>
      }
    </div>
    <p class="stat__value">
      {{ value() }}<span class="stat__unit">{{ unit() }}</span>
    </p>
    @if (hint()) {
      <p class="stat__hint">{{ hint() }}</p>
    }
    <ng-content />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      padding: var(--space-4) var(--space-5);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      min-width: 0;
    }

    .stat__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
    }

    .stat__label {
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }

    .stat__icon {
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      background: var(--color-accent-soft);
      color: var(--color-accent);
    }

    .stat__value {
      font-size: var(--text-3xl);
      font-weight: var(--weight-black);
      letter-spacing: -0.02em;
      line-height: 1;
    }

    .stat__unit {
      margin-left: var(--space-1);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--color-text-muted);
    }

    .stat__hint {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
    }

    :host(.stat--accent) .stat__value {
      color: var(--color-accent);
    }

    :host(.stat--success) .stat__value {
      color: var(--color-success);
    }

    :host(.stat--warning) .stat__value {
      color: var(--color-warning);
    }

    :host(.stat--error) .stat__value {
      color: var(--color-error);
    }
  `,
  host: { '[class]': '"stat--" + tone()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly unit = input('');
  readonly hint = input('');
  readonly icon = input<AppIconName | null>(null);
  readonly tone = input<StatTone>('default');
}
