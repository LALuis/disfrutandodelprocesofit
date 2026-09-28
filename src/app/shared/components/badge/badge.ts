import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-badge',
  template: '<ng-content />',
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: 2px var(--space-2);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      line-height: 1.4;
      white-space: nowrap;
      background: var(--color-surface-2);
      color: var(--color-text-muted);
    }

    :host(.badge--accent) {
      background: var(--color-accent-soft);
      color: var(--color-accent);
    }

    :host(.badge--success) {
      background: var(--color-success-soft);
      color: var(--color-success);
    }

    :host(.badge--warning) {
      background: var(--color-warning-soft);
      color: var(--color-warning);
    }

    :host(.badge--error) {
      background: var(--color-error-soft);
      color: var(--color-error);
    }

    :host(.badge--info) {
      background: var(--color-info-soft);
      color: var(--color-info);
    }
  `,
  host: { '[class]': '"badge--" + tone()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Badge {
  readonly tone = input<BadgeTone>('neutral');
}
