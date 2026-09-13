import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { GYM_BRAND } from '@shared/config/gym-brand';
import { NavItem } from '@shared/models/nav-item';
import { Icon } from '../icon/icon';

export type MobileNavMode = 'tabs' | 'drawer';

/**
 * Authenticated area chrome shared by the student and admin portals:
 * top bar with user + sign out, sidebar navigation on desktop and either bottom tabs
 * (student, mobile-first) or a drawer (admin) on small screens.
 */
@Component({
  selector: 'app-portal-shell',
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './portal-shell.html',
  styleUrl: './portal-shell.scss',
  host: { '[class.shell--tabs]': 'mobileNav() === "tabs"' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalShell {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly navItems = input.required<readonly NavItem[]>();
  readonly areaLabel = input.required<string>();
  readonly mobileNav = input<MobileNavMode>('tabs');

  protected readonly brand = GYM_BRAND;
  protected readonly user = this.authService.user;
  protected readonly drawerOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.drawerOpen.set(false));
  }

  protected toggleDrawer(): void {
    this.drawerOpen.update((open) => !open);
  }

  protected async signOut(): Promise<void> {
    await this.authService.signOut();
    await this.router.navigateByUrl('/login');
  }
}
