import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PortalShell } from '@shared/components/portal-shell/portal-shell';
import { NavItem } from '@shared/models/nav-item';

/** Student portal navigation. Sections are appended here as their milestones land. */
const STUDENT_NAV: readonly NavItem[] = [
  { label: 'Inicio', path: '/app', icon: 'home', exact: true },
];

@Component({
  selector: 'app-student-layout',
  imports: [RouterOutlet, PortalShell],
  template: `
    <app-portal-shell [navItems]="navItems" areaLabel="Portal alumno" mobileNav="tabs">
      <router-outlet />
    </app-portal-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentLayout {
  protected readonly navItems = STUDENT_NAV;
}
