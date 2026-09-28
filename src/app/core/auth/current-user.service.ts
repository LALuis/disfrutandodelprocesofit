import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { UsersService } from '@core/services/users.service';
import { FeatureKey, UserProfile } from '@shared/models/user-profile';
import { AuthService } from './auth.service';

/**
 * Firestore profile of the signed-in user (realtime). Feature flags read from here drive
 * navigation and guards; Firestore rules enforce the same flags server-side.
 */
@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);

  /**
   * `null` while signed out or when the profile document is missing. For a signed-in user
   * the first emission is the real document, so guards can rely on the first value.
   */
  readonly profile$: Observable<UserProfile | null> = this.authService.authState$.pipe(
    switchMap((user) =>
      user ? this.usersService.profile$(user.uid).pipe(catchError(() => of(null))) : of(null),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly profile = toSignal(this.profile$, { initialValue: null });

  readonly features = computed(() => this.profile()?.features ?? null);

  hasFeature(feature: FeatureKey): boolean {
    return this.features()?.[feature] === true;
  }

  hasFeature$(feature: FeatureKey): Observable<boolean> {
    return this.profile$.pipe(map((profile) => profile?.features[feature] === true));
  }
}
