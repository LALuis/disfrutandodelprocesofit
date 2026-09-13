import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: '',
  styles: `
    :host {
      display: inline-block;
      width: var(--spinner-size);
      height: var(--spinner-size);
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: var(--radius-full);
      animation: spin 0.7s linear infinite;
      flex-shrink: 0;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
  host: {
    role: 'status',
    '[attr.aria-label]': 'label()',
    '[style.--spinner-size.px]': 'size()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Spinner {
  readonly size = input(20);
  readonly label = input('Cargando');
}
