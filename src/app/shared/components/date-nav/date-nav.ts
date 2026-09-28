import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { addDays, formatDateLong, isIsoDate, todayIso } from '@shared/utilities/dates';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';

/** Previous / next day navigation with a native date input, bound through `date`. */
@Component({
  selector: 'app-date-nav',
  imports: [Button, Icon],
  template: `
    <button
      app-button
      variant="secondary"
      size="sm"
      type="button"
      aria-label="Día anterior"
      (click)="shift(-1)"
    >
      <app-icon name="chevron-left" [size]="18" />
    </button>
    <label class="date-nav__label">
      <span class="date-nav__text">{{ label() }}</span>
      <input
        class="date-nav__input"
        type="date"
        [value]="date()"
        (change)="onInput($event)"
        aria-label="Elegir fecha"
      />
    </label>
    <button
      app-button
      variant="secondary"
      size="sm"
      type="button"
      aria-label="Día siguiente"
      (click)="shift(1)"
    >
      <app-icon name="chevron-right" [size]="18" />
    </button>
    @if (date() !== today) {
      <button app-button variant="ghost" size="sm" type="button" (click)="date.set(today)">
        Hoy
      </button>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-5);
    }

    .date-nav__label {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 180px;
    }

    .date-nav__text {
      font-weight: var(--weight-semibold);
    }

    .date-nav__text::first-letter {
      text-transform: uppercase;
    }

    .date-nav__input {
      min-height: 36px;
      padding: 0 var(--space-2);
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-sm);
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateNav {
  readonly date = model.required<string>();
  readonly disabled = input(false);

  protected readonly today = todayIso();
  protected readonly label = computed(() => formatDateLong(this.date()));

  protected shift(days: number): void {
    this.date.set(addDays(this.date(), days));
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (isIsoDate(value)) {
      this.date.set(value);
    }
  }
}
