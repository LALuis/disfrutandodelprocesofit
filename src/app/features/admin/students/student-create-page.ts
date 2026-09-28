import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { messageFromError } from '@core/firebase/firebase-error';
import { CreateStudentResult, UsersService } from '@core/services/users.service';
import { Button } from '@shared/components/button/button';
import { Card } from '@shared/components/card/card';
import { Icon } from '@shared/components/icon/icon';
import { PageHeader } from '@shared/components/page-header/page-header';
import { ToastService } from '@shared/services/toast.service';
import { StudentForm, StudentFormValue } from './student-form';

/**
 * Creates a student through the `createStudent` Cloud Function and shows the one-time
 * password setup link the admin can share with the student.
 */
@Component({
  selector: 'app-student-create-page',
  imports: [RouterLink, PageHeader, Card, Button, Icon, StudentForm],
  templateUrl: './student-create-page.html',
  styleUrl: './student-create-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentCreatePage {
  private readonly usersService = inject(UsersService);
  private readonly toast = inject(ToastService);

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly created = signal<
    (CreateStudentResult & { name: string; email: string }) | null
  >(null);
  protected readonly copied = signal(false);

  protected async create(value: StudentFormValue): Promise<void> {
    this.submitting.set(true);
    this.errorMessage.set('');
    try {
      const result = await this.usersService.createStudent(value);
      this.created.set({
        ...result,
        name: `${value.firstName} ${value.lastName}`,
        email: value.email,
      });
      this.toast.success('Alumno creado correctamente.');
    } catch (error) {
      this.errorMessage.set(messageFromError(error));
    } finally {
      this.submitting.set(false);
    }
  }

  protected async copyLink(): Promise<void> {
    const link = this.created()?.passwordSetupLink;
    if (!link) {
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    } catch {
      this.toast.error('No pudimos copiar el enlace. Seleccionalo y copialo manualmente.');
    }
  }
}
