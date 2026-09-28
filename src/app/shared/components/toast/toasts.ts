import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '@shared/services/toast.service';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-toasts',
  imports: [Icon],
  template: `
    <div class="toasts" aria-live="polite" aria-atomic="false">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast toast--' + toast.tone" role="status">
          <span class="toast__message">{{ toast.message }}</span>
          <button
            type="button"
            class="toast__close"
            aria-label="Cerrar notificación"
            (click)="toastService.dismiss(toast.id)"
          >
            <app-icon name="close" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toasts {
      position: fixed;
      left: var(--space-4);
      right: var(--space-4);
      bottom: calc(var(--space-4) + env(safe-area-inset-bottom));
      z-index: var(--z-toast);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      pointer-events: none;

      @media (min-width: 768px) {
        left: auto;
        width: 360px;
      }
    }

    .toast {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border-strong);
      background: var(--color-surface-2);
      box-shadow: var(--shadow-md);
      font-size: var(--text-sm);
      pointer-events: auto;
    }

    .toast--success {
      border-color: var(--color-success);
    }

    .toast--error {
      border-color: var(--color-error);
    }

    .toast--info {
      border-color: var(--color-info);
    }

    .toast__message {
      flex: 1;
    }

    .toast__close {
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      border-radius: var(--radius-sm);
      color: var(--color-text-muted);

      &:hover {
        color: var(--color-text);
        background: var(--color-surface-hover);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toasts {
  protected readonly toastService = inject(ToastService);
}
