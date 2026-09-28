import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { messageFromError } from '@core/firebase/firebase-error';
import { UsersService } from '@core/services/users.service';
import { Card } from '@shared/components/card/card';
import { Icon } from '@shared/components/icon/icon';
import { LoadingState } from '@shared/components/loading-state/loading-state';
import { ToastService } from '@shared/services/toast.service';
import { StudentForm, StudentFormValue } from '../student-form';

@Component({
  selector: 'app-student-profile-tab',
  imports: [Card, Icon, LoadingState, StudentForm],
  template: `
    @if (profile.hasValue() && profile.value(); as student) {
      <app-card>
        @if (errorMessage()) {
          <p class="form__error" role="alert">
            <app-icon name="alert-triangle" [size]="16" />
            {{ errorMessage() }}
          </p>
        }
        <app-student-form
          [profile]="student"
          [submitting]="submitting()"
          submitLabel="Guardar cambios"
          (save)="save($event)"
        />
      </app-card>
    } @else {
      <app-loading-state />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentProfileTab {
  private readonly usersService = inject(UsersService);
  private readonly toast = inject(ToastService);

  readonly id = input.required<string>();

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly profile = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.usersService.profile$(params),
  });

  protected async save(value: StudentFormValue): Promise<void> {
    this.submitting.set(true);
    this.errorMessage.set('');
    try {
      const { email: _email, ...changes } = value;
      await this.usersService.updateProfile(this.id(), changes);
      this.toast.success('Perfil actualizado.');
    } catch (error) {
      this.errorMessage.set(messageFromError(error));
    } finally {
      this.submitting.set(false);
    }
  }
}
