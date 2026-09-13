import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from '@shared/components/icon/icon';

/** Stand-in for the map until an embedded map provider is configured. */
@Component({
  selector: 'app-location-placeholder',
  imports: [Icon],
  template: `
    <app-icon name="map-pin" [size]="32" />
    <p class="location__title">{{ address() || 'Dirección a confirmar' }}</p>
    <p class="location__hint">Mapa interactivo próximamente</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      min-height: 280px;
      padding: var(--space-6);
      text-align: center;
      border: 1px dashed var(--color-border-strong);
      border-radius: var(--radius-xl);
      background:
        radial-gradient(circle at 50% 50%, rgba(255, 43, 176, 0.12), transparent 60%),
        var(--color-surface);
      color: var(--color-accent);
    }

    .location__title {
      color: var(--color-text);
      font-weight: var(--weight-medium);
    }

    .location__hint {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }
  `,
  host: { role: 'img', 'aria-label': 'Ubicación del gimnasio (mapa próximamente)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationPlaceholder {
  readonly address = input('');
}
