import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PortalShell } from '@shared/components/portal-shell/portal-shell';
import { NavItem } from '@shared/models/nav-item';

/** Admin portal navigation. Sections are appended here as their milestones land. */
const ADMIN_NAV: readonly NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: 'dashboard', exact: true },
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
