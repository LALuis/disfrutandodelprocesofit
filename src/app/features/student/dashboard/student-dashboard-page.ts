import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { Card } from '@shared/components/card/card';
import { PageHeader } from '@shared/components/page-header/page-header';

/** Student home. Summary cards (bookings, plan, progress) arrive with their milestones. */
@Component({
  selector: 'app-student-dashboard-page',
  imports: [PageHeader, Card],
  template: `
    <app-page-header eyebrow="Inicio" [title]="greeting()" subtitle="Bienvenido a tu portal." />
    <app-card>
      <p class="text-muted">
        Acá vas a ver tu próxima reserva, tu plan de entrenamiento y tu progreso. Estamos terminando
        de preparar estas secciones.
      </p>
    </app-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDashboardPage {
  private readonly authService = inject(AuthService);

  protected readonly greeting = computed(() => {
    const user = this.authService.user();
    const name = user?.displayName || user?.email;
    return name ? `Hola, ${name}` : 'Hola';
  });
}
