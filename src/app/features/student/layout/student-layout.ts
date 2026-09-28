import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CurrentUserService } from '@core/auth/current-user.service';
import { PortalShell } from '@shared/components/portal-shell/portal-shell';
import { NavItem } from '@shared/models/nav-item';
import { FeatureKey } from '@shared/models/user-profile';

interface StudentNavItem extends NavItem {
  /** When set, the item is only shown if the feature is enabled on the profile. */
  readonly feature?: FeatureKey;
}

const STUDENT_NAV: readonly StudentNavItem[] = [
  { label: 'Inicio', path: '/app', icon: 'home', exact: true },
  { label: 'Agenda', path: '/app/agenda', icon: 'calendar' },
  { label: 'Progreso', path: '/app/progreso', icon: 'line-chart' },
  { label: 'Ficha', path: '/app/ficha', icon: 'clipboard' },
  { label: 'Entrenar', path: '/app/entrenamiento', icon: 'dumbbell' },
  { label: 'Nutrición', path: '/app/nutricion', icon: 'salad', feature: 'nutritionEnabled' },
  { label: 'Recetas', path: '/app/recetario', icon: 'chef-hat', feature: 'recipesEnabled' },
  { label: 'Cuenta', path: '/app/cuenta', icon: 'user-cog' },
];

/** Mobile-first student portal. Feature-gated sections disappear from the navigation. */
@Component({
  selector: 'app-student-layout',
  imports: [RouterOutlet, PortalShell],
  template: `
    <app-portal-shell [navItems]="navItems()" areaLabel="Portal alumno" mobileNav="tabs">
      <router-outlet />
    </app-portal-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentLayout {
  private readonly currentUser = inject(CurrentUserService);

  protected readonly navItems = computed<NavItem[]>(() => {
    const features = this.currentUser.features();
    return STUDENT_NAV.filter((item) => !item.feature || features?.[item.feature] === true);
  });
}
