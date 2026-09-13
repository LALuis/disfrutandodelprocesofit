import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { homeRouteForRole } from '@core/auth/auth.models';
import { AuthService } from '@core/auth/auth.service';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';

/**
 * Shown when a signed-in user reaches an area their role does not allow,
 * or when the account has no role assigned yet.
 */
@Component({
  selector: 'app-unauthorized-page',
  imports: [EmptyState, Button, RouterLink],
  template: `
    <div class="unauthorized">
      <app-empty-state icon="shield-alert" title="Sin acceso" [description]="description()">
        @if (hasRole()) {
          <a app-button variant="primary" [routerLink]="homeLink()">Ir a mi portal</a>
        }
        @if (isAuthenticated()) {
          <button app-button variant="secondary" type="button" (click)="signOut()">
            Cerrar sesión
          </button>
        } @else {
          <a app-button variant="primary" routerLink="/login">Ingresar</a>
        }
        <a app-button variant="ghost" routerLink="/">Volver al inicio</a>
      </app-empty-state>
    </div>
  `,
  styles: `
    .unauthorized {
      display: grid;
      place-items: center;
      min-height: 100dvh;
      padding: var(--space-4);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly hasRole = computed(() => this.authService.role() !== null);
  protected readonly homeLink = computed(() => homeRouteForRole(this.authService.role()));
  protected readonly description = computed(() =>
    this.hasRole()
      ? 'Tu cuenta no tiene permisos para ver esta sección.'
      : 'Tu cuenta todavía no tiene un rol asignado. Comunicate con el gimnasio para activarla.',
  );

  protected async signOut(): Promise<void> {
    await this.authService.signOut();
    await this.router.navigateByUrl('/login');
  }
}
