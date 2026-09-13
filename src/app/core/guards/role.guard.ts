import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UserRole } from '@core/auth/auth.models';
import { AuthService } from '@core/auth/auth.service';
import { loginRedirect } from './redirect.utils';

/**
 * Requires an authenticated user with the given role.
 * This is a UX layer only: Firestore rules and Cloud Functions enforce roles server-side.
 */
export function roleGuard(role: UserRole): CanActivateFn {
  return async (_route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = await firstValueFrom(authService.authState$);
    if (!user) {
      return loginRedirect(router, state.url);
    }
    return user.role === role ? true : router.createUrlTree(['/unauthorized']);
  };
}
