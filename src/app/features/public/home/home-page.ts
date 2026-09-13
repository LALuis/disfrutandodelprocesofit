import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GymSettingsService } from '@core/services/gym-settings.service';
import { Button } from '@shared/components/button/button';
import { Icon } from '@shared/components/icon/icon';
import { LocationPlaceholder } from '../components/location-placeholder';
import { SectionHeader } from '../components/section-header';
import { ContactInfo } from '../contact/contact-info';
import { PlansList } from '../plans/plans-list';
import { BENEFITS, GYM_FEATURES, METHOD_STEPS } from './home-content';

/** Splits the hero title into a plain first sentence and an accented remainder. */
export function splitHeroTitle(title: string): { lead: string; accent: string } {
  const match = /^(.+?[.!?])\s+(.+)$/.exec(title.trim());
  return match ? { lead: match[1], accent: match[2] } : { lead: title.trim(), accent: '' };
}

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, Button, Icon, SectionHeader, PlansList, ContactInfo, LocationPlaceholder],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  protected readonly settings = inject(GymSettingsService).settings;
  protected readonly heroTitle = computed(() => splitHeroTitle(this.settings().heroTitle));

  protected readonly benefits = BENEFITS;
  protected readonly methodSteps = METHOD_STEPS;
  protected readonly gymFeatures = GYM_FEATURES;
  protected readonly testimonialPlaceholders = [1, 2, 3];
}
