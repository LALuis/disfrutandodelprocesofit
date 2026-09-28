import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Initials avatar. Decorative: pair it with the visible name. */
@Component({
  selector: 'app-user-avatar',
  template: `{{ initials() }}`,
  styles: `
    :host {
      display: inline-grid;
      place-items: center;
      width: var(--avatar-size);
      height: var(--avatar-size);
      flex-shrink: 0;
      border-radius: var(--radius-full);
      background: var(--color-accent-soft);
      color: var(--color-accent);
      font-size: calc(var(--avatar-size) * 0.38);
      font-weight: var(--weight-bold);
      letter-spacing: 0.02em;
      user-select: none;
    }
  `,
  host: { 'aria-hidden': 'true', '[style.--avatar-size.px]': 'size()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatar {
  readonly firstName = input('');
  readonly lastName = input('');
  readonly size = input(40);

  protected readonly initials = computed(
    () => `${this.firstName().charAt(0)}${this.lastName().charAt(0)}`.toUpperCase() || '?',
  );
}
