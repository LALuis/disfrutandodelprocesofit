import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { homeRouteForRole } from '@core/auth/auth.models';
import { AuthService } from '@core/auth/auth.service';

/** Keeps already authenticated users away from guest-only pages such as login. */
export const guestGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = await firstValueFrom(authService.authState$);
  return user ? router.createUrlTree([homeRouteForRole(user.role)]) : true;
};
