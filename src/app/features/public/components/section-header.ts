import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Eyebrow + title + optional subtitle used by every public site section. */
@Component({
  selector: 'app-section-header',
  template: `
    <span class="eyebrow">{{ eyebrow() }}</span>
    <h2 class="section-header__title">{{ title() }}</h2>
    @if (subtitle()) {
      <p class="section-header__subtitle">{{ subtitle() }}</p>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      max-width: 640px;
      margin-bottom: var(--space-10);
    }

    :host(.section-header--center) {
      align-items: center;
      text-align: center;
      margin-inline: auto;
    }

    .section-header__title {
      font-size: clamp(1.75rem, 5vw, var(--text-4xl));
    }

    .section-header__subtitle {
      color: var(--color-text-muted);
      font-size: var(--text-lg);
    }
  `,
  host: { '[class.section-header--center]': 'align() === "center"' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeader {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly align = input<'start' | 'center'>('start');
}
