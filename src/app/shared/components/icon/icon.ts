import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { createElement } from 'lucide';
import { APP_ICONS, AppIconName } from './app-icons';

/**
 * Renders a Lucide icon as inline SVG. Decorative by default (`aria-hidden`);
 * pass a `label` when the icon is the only content conveying meaning.
 */
@Component({
  selector: 'app-icon',
  template: '',
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
      line-height: 0;
      vertical-align: middle;
    }
  `,
  host: {
    '[attr.aria-hidden]': 'label() ? null : "true"',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input.required<AppIconName>();
  readonly size = input(20);
  readonly strokeWidth = input(2);
  readonly label = input('');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    effect(() => {
      const svg = createElement(APP_ICONS[this.name()], {
        width: this.size(),
        height: this.size(),
        'stroke-width': this.strokeWidth(),
      });
      this.host.replaceChildren(svg);
    });
  }
}
