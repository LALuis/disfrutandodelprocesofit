import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { LoadingState } from '@shared/components/loading-state/loading-state';
import { Toasts } from '@shared/components/toast/toasts';

/**
 * Root component. Rendering waits until Firebase resolves the persisted session so that
 * role-dependent UI (header CTA, portal navigation) never flashes the wrong state.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingState, Toasts],
  template: `
    @if (ready()) {
      <router-outlet />
    } @else {
      <app-loading-state [fullscreen]="true" message="Cargando…" />
    }
    <app-toasts />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly ready = inject(AuthService).ready;
}
