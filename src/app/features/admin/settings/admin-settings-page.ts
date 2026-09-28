import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { messageFromError } from '@core/firebase/firebase-error';
import { GymSettingsService } from '@core/services/gym-settings.service';
import { Button } from '@shared/components/button/button';
import { Card } from '@shared/components/card/card';
import { FormField } from '@shared/components/form-field/form-field';
import { Icon } from '@shared/components/icon/icon';
import { PageHeader } from '@shared/components/page-header/page-header';
import { GymSettings } from '@shared/models/gym-settings';
import { ToastService } from '@shared/services/toast.service';
import { controlError } from '@shared/utilities/validators';

interface FieldDef {
  readonly key: keyof GymSettings;
  readonly label: string;
  readonly type: 'text' | 'tel' | 'email' | 'url' | 'textarea';
  readonly hint?: string;
}

const FIELDS: readonly FieldDef[] = [
  { key: 'gymName', label: 'Nombre del gimnasio', type: 'text' },
  {
    key: 'heroTitle',
    label: 'Título principal',
    type: 'text',
    hint: 'La segunda frase se muestra resaltada.',
  },
  { key: 'heroSubtitle', label: 'Subtítulo principal', type: 'text' },
  { key: 'phone', label: 'Teléfono', type: 'tel' },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    type: 'tel',
    hint: 'Con código de país, ej. +598 99 000 000.',
  },
  { key: 'email', label: 'Email de contacto', type: 'email' },
  { key: 'instagram', label: 'Instagram (URL)', type: 'url' },
  { key: 'facebook', label: 'Facebook (URL)', type: 'url' },
  { key: 'tiktok', label: 'TikTok (URL)', type: 'url' },
  { key: 'address', label: 'Dirección', type: 'text' },
  { key: 'openingHours', label: 'Horarios de atención', type: 'textarea' },
];

/** Public gym settings editor (`gymSettings/public`). */
@Component({
  selector: 'app-admin-settings-page',
  imports: [ReactiveFormsModule, PageHeader, Card, Button, Icon, FormField],
  templateUrl: './admin-settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSettingsPage {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(GymSettingsService);
  private readonly toast = inject(ToastService);

  protected readonly fields = FIELDS;
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly form = this.fb.nonNullable.group({
    gymName: ['', [Validators.required, Validators.maxLength(80)]],
    heroTitle: ['', [Validators.required, Validators.maxLength(120)]],
    heroSubtitle: ['', [Validators.maxLength(200)]],
    phone: ['', [Validators.maxLength(40)]],
    whatsapp: ['', [Validators.maxLength(40)]],
    email: ['', [Validators.email, Validators.maxLength(120)]],
    instagram: ['', [Validators.maxLength(200)]],
    facebook: ['', [Validators.maxLength(200)]],
    tiktok: ['', [Validators.maxLength(200)]],
    address: ['', [Validators.maxLength(200)]],
    openingHours: ['', [Validators.maxLength(300)]],
  });

  constructor() {
    // Seed the form from the live settings until the user starts editing.
    effect(() => {
      const settings = this.settingsService.settings();
      if (!this.form.dirty) {
        this.form.reset(settings);
      }
    });
  }

  protected error(key: keyof GymSettings): string {
    return controlError(this.form.controls[key]);
  }

  protected async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set('');
    try {
      const raw = this.form.getRawValue();
      const trimmed = Object.fromEntries(
        Object.entries(raw).map(([k, v]) => [k, v.trim()]),
      ) as unknown as GymSettings;
      await this.settingsService.save(trimmed);
      this.form.markAsPristine();
      this.toast.success('Configuración guardada.');
    } catch (error) {
      this.errorMessage.set(messageFromError(error));
    } finally {
      this.submitting.set(false);
    }
  }
}
