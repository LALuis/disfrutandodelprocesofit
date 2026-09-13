import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@shared/components/button/button';
import { Icon } from '@shared/components/icon/icon';
import { SectionHeader } from '../components/section-header';
import { PlansList } from './plans-list';

@Component({
  selector: 'app-plans-page',
  imports: [RouterLink, Button, Icon, SectionHeader, PlansList],
  template: `
    <section class="section">
      <div class="container">
        <app-section-header
          eyebrow="Planes"
          title="Planes de membresía"
          subtitle="Sin matrícula ni permanencia mínima. Elegí el ritmo que se adapte a tu semana y cambialo cuando quieras."
          align="center"
        />
        <app-plans-list />
        <div class="section__cta">
          <a app-button variant="ghost" routerLink="/contacto">
            ¿Tenés dudas? Hablemos
            <app-icon name="arrow-right" [size]="16" />
          </a>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlansPage {}
