import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@shared/components/button/button';
import { Icon } from '@shared/components/icon/icon';
import { GYM_BRAND } from '@shared/config/gym-brand';

/**
 * Public home. Milestone 1 ships the hero; the remaining sections (benefits, methodology,
 * plans, testimonials, contact, location) are built in the public-site milestone.
 */
@Component({
  selector: 'app-home-page',
  imports: [RouterLink, Button, Icon],
  template: `
    <section class="hero">
      <div class="container hero__inner">
        <span class="eyebrow">{{ brand.name }}</span>
        <h1 class="hero__title">
          Entrená con método.<br />
          <span class="text-accent">Disfrutá el proceso.</span>
        </h1>
        <p class="hero__subtitle">{{ brand.tagline }}</p>
        <div class="hero__actions">
          <a app-button variant="primary" size="lg" routerLink="/planes">
            Conocé nuestros planes
            <app-icon name="arrow-right" [size]="18" />
          </a>
          <a app-button variant="secondary" size="lg" routerLink="/login">Ingresar</a>
          <a
            app-button
            variant="ghost"
            size="lg"
            routerLink="/login"
            [queryParams]="{ redirectTo: '/app' }"
          >
            <app-icon name="calendar" [size]="18" />
            Agendate
          </a>
        </div>
      </div>
    </section>
  `,
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  protected readonly brand = GYM_BRAND;
}
