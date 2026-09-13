import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Title block used at the top of portal pages, with an optional actions slot. */
@Component({
  selector: 'app-page-header',
  template: `
    <div class="page-header__text">
      @if (eyebrow()) {
        <span class="eyebrow">{{ eyebrow() }}</span>
      }
      <h1 class="page-header__title">{{ title() }}</h1>
      @if (subtitle()) {
        <p class="page-header__subtitle">{{ subtitle() }}</p>
      }
    </div>
    <div class="page-header__actions">
      <ng-content select="[actions]" />
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .page-header__title {
      font-size: var(--text-2xl);
    }

    .page-header__subtitle {
      margin-top: var(--space-1);
      color: var(--color-text-muted);
    }

    .page-header__actions {
      display: flex;
      gap: var(--space-2);
    }

    .page-header__actions:empty {
      display: none;
    }

    @media (min-width: 768px) {
      .page-header__title {
        font-size: var(--text-3xl);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly eyebrow = input('');
}
