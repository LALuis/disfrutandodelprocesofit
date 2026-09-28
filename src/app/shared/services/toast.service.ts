import { Injectable, signal } from '@angular/core';

export type ToastTone = 'success' | 'error' | 'info';

export interface Toast {
  readonly id: number;
  readonly tone: ToastTone;
  readonly message: string;
}

const DEFAULT_DURATION_MS = 4500;

/** Lightweight notifications rendered by `<app-toasts>` at the root of the app. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly toastsState = signal<Toast[]>([]);

  readonly toasts = this.toastsState.asReadonly();

  success(message: string): void {
    this.push('success', message);
  }

  error(message: string): void {
    this.push('error', message, 7000);
  }

  info(message: string): void {
    this.push('info', message);
  }

  dismiss(id: number): void {
    this.toastsState.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  private push(tone: ToastTone, message: string, duration = DEFAULT_DURATION_MS): void {
    const toast: Toast = { id: this.nextId++, tone, message };
    this.toastsState.update((toasts) => [...toasts, toast]);
    setTimeout(() => this.dismiss(toast.id), duration);
  }
}
