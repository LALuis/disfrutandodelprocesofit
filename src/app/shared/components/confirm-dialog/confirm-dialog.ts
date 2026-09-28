import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Button } from '../button/button';

export interface ConfirmDialogOptions {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly danger?: boolean;
}

/** Native `<dialog>` based confirmation. Opened programmatically by `ConfirmDialogService`. */
@Component({
  selector: 'app-confirm-dialog',
  imports: [Button],
  template: `
    <dialog #dialog class="confirm" (cancel)="close(false)" aria-labelledby="confirm-title">
      <h2 id="confirm-title" class="confirm__title">{{ options().title }}</h2>
      <p class="confirm__message">{{ options().message }}</p>
      <div class="confirm__actions">
        <button app-button variant="ghost" type="button" (click)="close(false)">
          {{ options().cancelLabel ?? 'Cancelar' }}
        </button>
        <button
          app-button
          [variant]="options().danger ? 'danger' : 'primary'"
          type="button"
          (click)="close(true)"
        >
          {{ options().confirmLabel ?? 'Confirmar' }}
        </button>
      </div>
    </dialog>
  `,
  styles: `
    .confirm {
      width: min(92vw, 420px);
      padding: var(--space-6);
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
      color: var(--color-text);
      box-shadow: var(--shadow-lg);

      &::backdrop {
        background: var(--color-overlay);
      }
    }

    .confirm__title {
      font-size: var(--text-xl);
      margin-bottom: var(--space-2);
    }

    .confirm__message {
      color: var(--color-text-muted);
      margin-bottom: var(--space-6);
    }

    .confirm__actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  readonly options = input.required<ConfirmDialogOptions>();
  readonly closed = output<boolean>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }

  protected close(confirmed: boolean): void {
    this.dialog().nativeElement.close();
    this.closed.emit(confirmed);
  }
}
