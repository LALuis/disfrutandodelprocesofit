import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Card } from '@shared/components/card/card';
import { PageHeader } from '@shared/components/page-header/page-header';

/** Admin home. Summary cards (students, bookings, slots) arrive with their milestones. */
@Component({
  selector: 'app-admin-dashboard-page',
  imports: [PageHeader, Card],
  template: `
    <app-page-header
      eyebrow="Administración"
      title="Dashboard"
      subtitle="Resumen de la actividad del gimnasio."
    />
    <app-card>
      <p class="text-muted">
        Acá vas a ver alumnos activos, reservas de hoy y disponibilidad de horarios. Estas métricas
        se habilitan junto con cada módulo.
      </p>
    </app-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardPage {}
