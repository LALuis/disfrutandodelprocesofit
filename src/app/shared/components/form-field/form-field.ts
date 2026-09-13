import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Label + control + hint/error wrapper. The projected control must set `id` to `inputId`
 * and can reference `<inputId>-error` via `aria-describedby` when an error is shown.
 */
@Component({
  selector: 'app-form-field',
  template: `
    <label class="form-field__label" [for]="inputId()">{{ label() }}</label>
    <ng-content />
    @if (error()) {
      <p class="form-field__error" [id]="errorId()" role="alert">{{ error() }}</p>
    } @else if (hint()) {
      <p class="form-field__hint">{{ hint() }}</p>
    }
  `,
  styleUrl: './form-field.scss',
  host: { '[class.form-field--invalid]': '!!error()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormField {
  readonly label = input.required<string>();
  readonly inputId = input.required<string>();
  readonly hint = input('');
  readonly error = input('');

  protected readonly errorId = computed(() => `${this.inputId()}-error`);
}
