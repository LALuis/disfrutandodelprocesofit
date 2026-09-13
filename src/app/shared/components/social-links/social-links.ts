import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { GymSettings } from '@shared/models/gym-settings';
import { whatsappUrl } from '@shared/utilities/contact-links';
import { AppIconName } from '../icon/app-icons';
import { Icon } from '../icon/icon';

interface SocialLink {
  readonly label: string;
  readonly icon: AppIconName;
  readonly url: string;
}

/** Icon links to the gym's social networks; only configured networks are rendered. */
@Component({
  selector: 'app-social-links',
  imports: [Icon],
  template: `
    <ul class="social" [class.social--lg]="size() === 'lg'">
      @for (link of links(); track link.label) {
        <li>
          <a
            class="social__link"
            [href]="link.url"
            target="_blank"
            rel="noopener noreferrer"
            [attr.aria-label]="link.label"
            [title]="link.label"
          >
            <app-icon [name]="link.icon" [size]="size() === 'lg' ? 22 : 18" />
          </a>
        </li>
      }
    </ul>
  `,
  styles: `
    .social {
      display: flex;
      gap: var(--space-2);
    }

    .social__link {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      background: var(--color-surface-2);
      border: 1px solid var(--color-border);
      color: var(--color-text-muted);
      transition:
        color var(--transition-fast),
        border-color var(--transition-fast),
        background-color var(--transition-fast);

      &:hover {
        color: var(--color-accent);
        border-color: var(--color-accent);
        background: var(--color-accent-soft);
      }
    }

    .social--lg .social__link {
      width: 48px;
      height: 48px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialLinks {
  readonly settings = input.required<GymSettings>();
  readonly size = input<'md' | 'lg'>('md');

  protected readonly links = computed<SocialLink[]>(() => {
    const s = this.settings();
    const candidates: SocialLink[] = [
      { label: 'Instagram', icon: 'instagram', url: s.instagram },
      { label: 'Facebook', icon: 'facebook', url: s.facebook },
      { label: 'TikTok', icon: 'tiktok', url: s.tiktok },
      { label: 'WhatsApp', icon: 'whatsapp', url: whatsappUrl(s.whatsapp) },
    ];
    return candidates.filter((link) => link.url !== '');
  });
}
