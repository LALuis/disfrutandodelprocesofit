import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Button } from '@shared/components/button/button';
import { Icon } from '@shared/components/icon/icon';
import { SocialLinks } from '@shared/components/social-links/social-links';
import { GymSettings } from '@shared/models/gym-settings';
import { mailtoUrl, telUrl, whatsappUrl } from '@shared/utilities/contact-links';

/** Contact block (WhatsApp CTA, phone, email, address, hours, socials) fed by gym settings. */
@Component({
  selector: 'app-contact-info',
  imports: [Button, Icon, SocialLinks],
  templateUrl: './contact-info.html',
  styleUrl: './contact-info.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactInfo {
  readonly settings = input.required<GymSettings>();

  protected readonly whatsappHref = computed(() =>
    whatsappUrl(this.settings().whatsapp, 'Hola! Quiero más información sobre el gimnasio.'),
  );
  protected readonly phoneHref = computed(() => telUrl(this.settings().phone));
  protected readonly mailHref = computed(() => mailtoUrl(this.settings().email));
}
