import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';

/** Placeholder for public sections scheduled for later milestones. Reads `title` from route data. */
@Component({
  selector: 'app-coming-soon-page',
  imports: [EmptyState, Button, RouterLink],
  template: `
    <div class="container">
      <app-empty-state
        icon="dumbbell"
        [title]="title()"
        description="Estamos preparando esta sección. Muy pronto vas a encontrarla acá."
      >
        <a app-button variant="secondary" routerLink="/">Volver al inicio</a>
      </app-empty-state>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComingSoonPage {
  readonly title = input.required<string>();
}
