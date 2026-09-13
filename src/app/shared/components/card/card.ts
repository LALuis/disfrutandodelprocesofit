import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-card',
  template: '<ng-content />',
  styles: `
    :host {
      display: block;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    :host(.card--sm) {
      padding: var(--space-4);
    }

    :host(.card--md) {
      padding: var(--space-6);
    }

    :host(.card--lg) {
      padding: var(--space-8);
    }

    :host(.card--interactive) {
      transition:
        border-color var(--transition-fast),
        transform var(--transition-fast);
    }

    :host(.card--interactive:hover) {
      border-color: var(--color-border-strong);
      transform: translateY(-2px);
    }
  `,
  host: {
    '[class]': '"card--" + padding()',
    '[class.card--interactive]': 'interactive()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card {
  readonly padding = input<CardPadding>('md');
  readonly interactive = input(false);
}
