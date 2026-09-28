import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { mapAuthError } from '@core/auth/auth-error.mapper';
import { AuthService } from '@core/auth/auth.service';
import { CurrentUserService } from '@core/auth/current-user.service';
import { messageFromError } from '@core/firebase/firebase-error';
import { UsersService } from '@core/services/users.service';
import { Button } from '@shared/components/button/button';
import { Card } from '@shared/components/card/card';
import { FormField } from '@shared/components/form-field/form-field';
import { Icon } from '@shared/components/icon/icon';
import { PageHeader } from '@shared/components/page-header/page-header';
import { UserAvatar } from '@shared/components/user-avatar/user-avatar';
import { fullName } from '@shared/models/user-profile';
import { ToastService } from '@shared/services/toast.service';
import { controlError } from '@shared/utilities/validators';

/** "Mi cuenta": contact phone (the only self-editable field), password change and sign out. */
@Component({
  selector: 'app-account-page',
  imports: [ReactiveFormsModule, PageHeader, Card, Button, Icon, FormField, UserAvatar],
  templateUrl: './account-page.html',
  styleUrl: './account-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly profile = inject(CurrentUserService).profile;
  protected readonly fullName = fullName;
  protected readonly savingPhone = signal(false);
  protected readonly changingPassword = signal(false);
  protected readonly passwordError = signal('');

  protected readonly phoneForm = this.fb.nonNullable.group({
    phone: ['', [Validators.maxLength(40)]],
  });

  protected readonly passwordForm = this.fb.nonNullable.group(
    {
      current: ['', [Validators.required]],
      next: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  constructor() {
    effect(() => {
      const profile = this.profile();
      if (profile && !this.phoneForm.dirty) {
        this.phoneForm.reset({ phone: profile.phone });
      }
    });
  }

  protected phoneError(): string {
    return controlError(this.phoneForm.controls.phone);
  }

  protected pwdError(control: 'current' | 'next' | 'confirm'): string {
    const c = this.passwordForm.controls[control];
    if (control === 'confirm' && c.touched && this.passwordForm.hasError('mismatch')) {
      return 'Las contraseñas no coinciden.';
    }
    return controlError(c);
  }

  protected async savePhone(): Promise<void> {
    const uid = this.authService.user()?.uid;
    if (this.phoneForm.invalid || !uid) {
      return;
    }
    this.savingPhone.set(true);
    try {
      await this.usersService.updateOwnPhone(uid, this.phoneForm.controls.phone.value);
      this.phoneForm.markAsPristine();
      this.toast.success('Teléfono actualizado.');
    } catch (error) {
      this.toast.error(messageFromError(error));
    } finally {
      this.savingPhone.set(false);
    }
  }

  protected async changePassword(): Promise<void> {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid || this.changingPassword()) {
      return;
    }
    const { current, next } = this.passwordForm.getRawValue();
    this.changingPassword.set(true);
    this.passwordError.set('');
    try {
      await this.authService.changePassword(current, next);
      this.passwordForm.reset();
      this.toast.success('Contraseña actualizada.');
    } catch (error) {
      this.passwordError.set(mapAuthError(error));
    } finally {
      this.changingPassword.set(false);
    }
  }

  protected async signOut(): Promise<void> {
    await this.authService.signOut();
    await this.router.navigateByUrl('/login');
  }
}

function passwordsMatch(group: AbstractControl): { mismatch: true } | null {
  const next = group.get('next')?.value;
  const confirm = group.get('confirm')?.value;
  return next && confirm && next !== confirm ? { mismatch: true } : null;
}
