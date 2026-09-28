import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PortalShell } from '@shared/components/portal-shell/portal-shell';
import { NavItem } from '@shared/models/nav-item';

const ADMIN_NAV: readonly NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: 'dashboard', exact: true },
  { label: 'Alumnos', path: '/admin/alumnos', icon: 'users' },
  { label: 'Horarios', path: '/admin/horarios', icon: 'clock' },
  { label: 'Reservas', path: '/admin/reservas', icon: 'calendar' },
  { label: 'Entrenamiento', path: '/admin/entrenamiento', icon: 'dumbbell' },
  { label: 'Nutrición', path: '/admin/nutricion', icon: 'salad' },
  { label: 'Recetario', path: '/admin/recetas', icon: 'chef-hat' },
  { label: 'Planes', path: '/admin/planes', icon: 'credit-card' },
  { label: 'Configuración', path: '/admin/configuracion', icon: 'settings' },
];

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, PortalShell],
  template: `
    <app-portal-shell [navItems]="navItems" areaLabel="Administración" mobileNav="drawer">
      <router-outlet />
    </app-portal-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout {
  protected readonly navItems = ADMIN_NAV;
}
