import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { loginRedirect } from './redirect.utils';

/** Requires an authenticated session; anonymous visitors are sent to the login page. */
export const authGuard: CanActivateFn = async (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = await firstValueFrom(authService.authState$);
  return user ? true : loginRedirect(router, state.url);
};
