import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';
import { mapAuthError } from '@core/auth/auth-error.mapper';
import { homeRouteForRole, UserRole } from '@core/auth/auth.models';
import { AuthService } from '@core/auth/auth.service';
import { isSafeRedirect, REDIRECT_QUERY_PARAM } from '@core/guards/redirect.utils';
import { Button } from '@shared/components/button/button';
import { Card } from '@shared/components/card/card';
import { FormField } from '@shared/components/form-field/form-field';
import { Icon } from '@shared/components/icon/icon';
import { GYM_BRAND } from '@shared/config/gym-brand';

/** Shared login for students and admins; the destination is decided by the user's role. */
@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, Button, Card, FormField, Icon],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly brand = GYM_BRAND;
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected get emailError(): string {
    const control = this.form.controls.email;
    if (!control.touched || control.valid) {
      return '';
    }
    return control.hasError('required') ? 'Ingresá tu email.' : 'El email no es válido.';
  }

  protected get passwordError(): string {
    const control = this.form.controls.password;
    return control.touched && control.hasError('required') ? 'Ingresá tu contraseña.' : '';
  }

  protected async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set('');
    try {
      const { email, password } = this.form.getRawValue();
      await this.authService.signIn(email, password);
      // Wait for the token (and its role claim) to be resolved before choosing a destination.
      const user = await firstValueFrom(
        this.authService.authState$.pipe(filter((current) => current !== null)),
      );
      await this.router.navigateByUrl(this.destinationFor(user.role));
    } catch (error) {
      this.errorMessage.set(mapAuthError(error));
    } finally {
      this.submitting.set(false);
    }
  }

  private destinationFor(role: UserRole | null): string {
    const requested = this.route.snapshot.queryParamMap.get(REDIRECT_QUERY_PARAM);
    return isSafeRedirect(requested) ? requested : homeRouteForRole(role);
  }
}
