import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { messageFromError } from '@core/firebase/firebase-error';
import { UsersService } from '@core/services/users.service';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { Icon } from '@shared/components/icon/icon';
import { LoadingState } from '@shared/components/loading-state/loading-state';
import { UserAvatar } from '@shared/components/user-avatar/user-avatar';
import { fullName, UserProfile } from '@shared/models/user-profile';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { ToastService } from '@shared/services/toast.service';
import { formatDateShort } from '@shared/utilities/dates';

const TABS = [
  { path: 'perfil', label: 'Perfil' },
  { path: 'mediciones', label: 'Mediciones' },
  { path: 'entrenamiento', label: 'Entrenamiento' },
  { path: 'nutricion', label: 'Nutrición' },
  { path: 'reservas', label: 'Reservas' },
] as const;

/** Student file: header with account actions and routed tabs for each domain. */
@Component({
  selector: 'app-student-detail-page',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    Button,
    Icon,
    Badge,
    UserAvatar,
    LoadingState,
    ErrorState,
    EmptyState,
  ],
  templateUrl: './student-detail-page.html',
  styleUrl: './student-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDetailPage {
  private readonly usersService = inject(UsersService);
  private readonly authService = inject(AuthService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  /** Route param (`/admin/alumnos/:id`). */
  readonly id = input.required<string>();

  protected readonly tabs = TABS;
  protected readonly busy = signal(false);
  protected readonly fullName = fullName;
  protected readonly formatDate = formatDateShort;

  protected readonly profile = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.usersService.profile$(params),
  });

  protected isSelf(profile: UserProfile): boolean {
    return profile.id === this.authService.user()?.uid;
  }

  protected async toggleActive(profile: UserProfile): Promise<void> {
    const activating = !profile.active;
    const ok = await this.confirm.ask({
      title: activating ? 'Habilitar alumno' : 'Deshabilitar alumno',
      message: activating
        ? `${fullName(profile)} va a poder ingresar y reservar turnos nuevamente.`
        : `${fullName(profile)} no va a poder ingresar al portal ni reservar turnos hasta que lo habilites de nuevo.`,
      confirmLabel: activating ? 'Habilitar' : 'Deshabilitar',
      danger: !activating,
    });
    if (!ok) {
      return;
    }
    await this.run(
      () => this.usersService.setActive(profile.id, activating),
      activating ? 'Alumno habilitado.' : 'Alumno deshabilitado.',
    );
  }

  protected async toggleRole(profile: UserProfile): Promise<void> {
    const makeAdmin = profile.role !== 'ADMIN';
    const ok = await this.confirm.ask({
      title: makeAdmin ? 'Dar acceso de administrador' : 'Quitar acceso de administrador',
      message: makeAdmin
        ? `${fullName(profile)} va a poder gestionar todo el gimnasio.`
        : `${fullName(profile)} va a pasar a tener acceso de alumno.`,
      confirmLabel: 'Confirmar',
      danger: makeAdmin,
    });
    if (!ok) {
      return;
    }
    await this.run(
      () => this.usersService.setRole(profile.id, makeAdmin ? 'ADMIN' : 'STUDENT'),
      'Rol actualizado.',
    );
  }

  private async run(action: () => Promise<void>, successMessage: string): Promise<void> {
    this.busy.set(true);
    try {
      await action();
      this.toast.success(successMessage);
    } catch (error) {
      this.toast.error(messageFromError(error));
    } finally {
      this.busy.set(false);
    }
  }
}
