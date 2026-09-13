import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Spinner } from '../spinner/spinner';

@Component({
  selector: 'app-loading-state',
  imports: [Spinner],
  template: `
    <app-spinner [size]="28" [label]="message()" />
    <p class="loading-state__message">{{ message() }}</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      padding: var(--space-12) var(--space-4);
      color: var(--color-text-muted);
      text-align: center;
    }

    :host(.loading-state--fullscreen) {
      min-height: 100dvh;
    }

    app-spinner {
      color: var(--color-accent);
    }

    .loading-state__message {
      font-size: var(--text-sm);
    }
  `,
  host: { '[class.loading-state--fullscreen]': 'fullscreen()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingState {
  readonly message = input('Cargando…');
  readonly fullscreen = input(false);
}
