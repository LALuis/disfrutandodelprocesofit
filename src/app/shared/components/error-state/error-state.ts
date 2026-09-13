import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-error-state',
  imports: [Icon, Button],
  template: `
    <div class="error-state__icon">
      <app-icon name="alert-triangle" [size]="28" />
    </div>
    <h2 class="error-state__title">{{ title() }}</h2>
    <p class="error-state__description">{{ message() }}</p>
    <div class="error-state__actions">
      @if (retryLabel()) {
        <button app-button variant="secondary" type="button" (click)="retry.emit()">
          {{ retryLabel() }}
        </button>
      }
      <ng-content />
    </div>
  `,
  styleUrl: '../empty-state/state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorState {
  readonly title = input('Algo salió mal');
  readonly message = input('No pudimos cargar la información. Intentá de nuevo.');
  /** When empty, no retry button is rendered. */
  readonly retryLabel = input('Reintentar');
  readonly retry = output<void>();
}
