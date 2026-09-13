import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';

@Component({
  selector: 'app-not-found-page',
  imports: [EmptyState, Button, RouterLink],
  template: `
    <div class="not-found">
      <app-empty-state
        icon="alert-triangle"
        title="Página no encontrada"
        description="La dirección que buscás no existe o fue movida."
      >
        <a app-button variant="primary" routerLink="/">Volver al inicio</a>
      </app-empty-state>
    </div>
  `,
  styles: `
    .not-found {
      display: grid;
      place-items: center;
      min-height: 100dvh;
      padding: var(--space-4);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {}
