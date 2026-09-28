import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * `isotipo`: head + headband crop. The full illustration blurs into a blob below ~64 px,
 * so small marks (headers, login, footer, favicon) use this crop instead.
 * `full`: complete logo with the wordmark; only legible from ~180 px.
 */
export type BrandLogoVariant = 'isotipo' | 'full';

const SOURCES: Record<BrandLogoVariant, string> = {
  isotipo: 'isotipo.png',
  full: 'logo.png',
};

/**
 * Gym logo. Decorative by default (the name is rendered as text next to it); pass an `alt`
 * when the logo stands alone.
 */
@Component({
  selector: 'app-brand-logo',
  template: `
    <img
      [src]="src()"
      [width]="size()"
      [height]="size()"
      [alt]="alt()"
      [attr.aria-hidden]="alt() ? null : 'true'"
      [attr.loading]="eager() ? null : 'lazy'"
      decoding="async"
    />
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
      line-height: 0;
    }

    img {
      width: 100%;
      height: auto;
    }
  `,
  host: { '[style.width.px]': 'size()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandLogo {
  readonly variant = input<BrandLogoVariant>('isotipo');
  readonly size = input(40);
  readonly alt = input('');
  /** Set for above-the-fold marks so they are not lazy-loaded. */
  readonly eager = input(false);

  protected readonly src = computed(() => SOURCES[this.variant()]);
}
