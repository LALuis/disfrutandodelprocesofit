import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Spinner } from '../spinner/spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Styles native `<button>` and `<a>` elements so semantics and keyboard behaviour
 * stay untouched. Usage: `<button app-button variant="primary">Guardar</button>`.
 */
@Component({
  selector: 'button[app-button], a[app-button]',
  templateUrl: './button.html',
  styleUrl: './button.scss',
  imports: [Spinner],
  host: {
    '[class]': 'classes()',
    '[attr.disabled]': 'isDisabled() ? "" : null',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly block = input(false);
  readonly loading = input(false);
  readonly disabled = input(false);

  protected readonly isDisabled = computed(() => this.disabled() || this.loading());
  protected readonly classes = computed(() =>
    [
      'btn',
      `btn--${this.variant()}`,
      `btn--${this.size()}`,
      this.block() ? 'btn--block' : '',
      this.loading() ? 'btn--loading' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );
}
