import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { of } from 'rxjs';
import { CurrentUserService } from '@core/auth/current-user.service';
import { DEFAULT_FEATURES, UserProfile } from '@shared/models/user-profile';
import { featureGuard } from './feature.guard';

function profileWith(nutritionEnabled: boolean): UserProfile {
  return {
    id: 'u',
    firstName: 'A',
    lastName: 'B',
    email: 'a@b.c',
    phone: '',
    birthDate: '',
    active: true,
    joinDate: '',
    notes: '',
    role: 'STUDENT',
    features: { ...DEFAULT_FEATURES, nutritionEnabled },
    activeTrainingPlanId: null,
    activeNutritionPlanId: null,
  };
}

async function run(profile: UserProfile | null): Promise<boolean | UrlTree> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: CurrentUserService,
        useValue: { hasFeature$: (key: 'nutritionEnabled') => of(profile?.features[key] === true) },
      },
    ],
  });
  return TestBed.runInInjectionContext(() =>
    featureGuard('nutritionEnabled')({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
  ) as Promise<boolean | UrlTree>;
}

describe('featureGuard', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('allows the route when the feature is enabled on the profile', async () => {
    expect(await run(profileWith(true))).toBe(true);
  });

  it('redirects to /unauthorized when the feature is disabled', async () => {
    const result = await run(profileWith(false));
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/unauthorized');
  });

  it('redirects to /unauthorized when there is no profile', async () => {
    const result = await run(null);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/unauthorized');
  });
});
