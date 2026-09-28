import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CurrentUserService } from '@core/auth/current-user.service';
import { FeatureKey } from '@shared/models/user-profile';

/**
 * Blocks routes of per-user features (nutrition, recipes) that are disabled on the profile.
 * UX layer only: Firestore rules deny the underlying reads as well.
 */
export function featureGuard(feature: FeatureKey): CanActivateFn {
  return async () => {
    const currentUser = inject(CurrentUserService);
    const router = inject(Router);
    const enabled = await firstValueFrom(currentUser.hasFeature$(feature));
    return enabled ? true : router.createUrlTree(['/unauthorized']);
  };
}
