import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
} from '@angular/core';
import {
  ConfirmDialog,
  ConfirmDialogOptions,
} from '@shared/components/confirm-dialog/confirm-dialog';

/** Imperative confirmation prompt: `if (await confirm.ask({...})) { ... }`. */
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);

  ask(options: ConfirmDialogOptions): Promise<boolean> {
    const componentRef = createComponent(ConfirmDialog, { environmentInjector: this.injector });
    componentRef.setInput('options', options);
    document.body.appendChild(componentRef.location.nativeElement);
    this.appRef.attachView(componentRef.hostView);

    return new Promise<boolean>((resolve) => {
      const subscription = componentRef.instance.closed.subscribe((confirmed) => {
        subscription.unsubscribe();
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
        resolve(confirmed);
      });
    });
  }
}
