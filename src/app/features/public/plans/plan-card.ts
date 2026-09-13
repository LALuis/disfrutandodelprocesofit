import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@shared/components/button/button';
import { Icon } from '@shared/components/icon/icon';
import { MembershipPlan, PLAN_FREQUENCY_LABELS } from '@shared/models/membership-plan';
import { PricePipe } from '@shared/pipes/price.pipe';
import { whatsappUrl } from '@shared/utilities/contact-links';

/** Public membership plan card. `whatsapp` enables the "consultar" CTA when configured. */
@Component({
  selector: 'app-plan-card',
  imports: [RouterLink, Button, Icon, PricePipe],
  templateUrl: './plan-card.html',
  styleUrl: './plan-card.scss',
  host: { '[class.plan-card--highlighted]': 'plan().highlighted' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanCard {
  readonly plan = input.required<MembershipPlan>();
  readonly whatsapp = input('');

  protected readonly frequencyLabel = computed(() => PLAN_FREQUENCY_LABELS[this.plan().frequency]);
  protected readonly contactUrl = computed(() =>
    whatsappUrl(this.whatsapp(), `Hola! Quiero consultar por el plan "${this.plan().name}".`),
  );
}
