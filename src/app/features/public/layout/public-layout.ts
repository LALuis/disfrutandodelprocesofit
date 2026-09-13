import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { homeRouteForRole } from '@core/auth/auth.models';
import { AuthService } from '@core/auth/auth.service';
import { Button } from '@shared/components/button/button';
import { Icon } from '@shared/components/icon/icon';
import { GYM_BRAND } from '@shared/config/gym-brand';

interface NavItem {
  readonly label: string;
  readonly path: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Inicio', path: '/' },
  { label: 'Planes', path: '/planes' },
  { label: 'Contacto', path: '/contacto' },
];

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Button, Icon],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicLayout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly brand = GYM_BRAND;
  protected readonly navItems = NAV_ITEMS;
  protected readonly menuOpen = signal(false);
  protected readonly currentYear = new Date().getFullYear();

  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly portalLink = computed(() => homeRouteForRole(this.authService.role()));

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuOpen.set(false));
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }
}
