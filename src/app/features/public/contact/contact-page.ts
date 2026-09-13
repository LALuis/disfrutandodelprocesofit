import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GymSettingsService } from '@core/services/gym-settings.service';
import { LocationPlaceholder } from '../components/location-placeholder';
import { SectionHeader } from '../components/section-header';
import { ContactInfo } from './contact-info';

@Component({
  selector: 'app-contact-page',
  imports: [SectionHeader, ContactInfo, LocationPlaceholder],
  template: `
    <section class="section">
      <div class="container">
        <app-section-header
          eyebrow="Contacto"
          title="Hablemos"
          subtitle="Escribinos por WhatsApp para consultar planes, horarios o coordinar tu primera clase."
        />
        <div class="contact-grid">
          <app-contact-info [settings]="settings()" />
          <app-location-placeholder [address]="settings().address" />
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPage {
  protected readonly settings = inject(GymSettingsService).settings;
}
