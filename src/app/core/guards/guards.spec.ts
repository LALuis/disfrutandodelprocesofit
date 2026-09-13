import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { of } from 'rxjs';
import { AuthUser } from '@core/auth/auth.models';
import { AuthService } from '@core/auth/auth.service';
import { authGuard } from './auth.guard';
import { guestGuard } from './guest.guard';
import { roleGuard } from './role.guard';

const ADMIN: AuthUser = { uid: 'a', email: 'admin@gym.local', displayName: null, role: 'ADMIN' };
const STUDENT: AuthUser = { uid: 's', email: 'st@gym.local', displayName: null, role: 'STUDENT' };
const NO_ROLE: AuthUser = { uid: 'n', email: 'new@gym.local', displayName: null, role: null };

function setup(user: AuthUser | null): Router {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: AuthService, useValue: { authState$: of(user) } }],
  });
  return TestBed.inject(Router);
}

function run(
  guard: ReturnType<typeof roleGuard>,
  url = '/admin/students',
): Promise<boolean | UrlTree> {
  const route = {} as ActivatedRouteSnapshot;
  const state = { url } as RouterStateSnapshot;
  return TestBed.runInInjectionContext(() => guard(route, state)) as Promise<boolean | UrlTree>;
}

function urlOf(router: Router, result: boolean | UrlTree): string {
  return typeof result === 'boolean' ? String(result) : router.serializeUrl(result);
}

describe('authGuard', () => {
  it('lets authenticated users through', async () => {
    setup(STUDENT);
    expect(await run(authGuard)).toBe(true);
  });

  it('redirects anonymous users to login preserving the attempted url', async () => {
    const router = setup(null);
    const result = await run(authGuard, '/app/agenda');
    expect(urlOf(router, result)).toBe('/login?redirectTo=%2Fapp%2Fagenda');
  });
});

describe('roleGuard', () => {
  it('allows the matching role', async () => {
    setup(ADMIN);
    expect(await run(roleGuard('ADMIN'))).toBe(true);
  });

  it('sends a signed-in user with another role to /unauthorized', async () => {
    const router = setup(STUDENT);
    expect(urlOf(router, await run(roleGuard('ADMIN')))).toBe('/unauthorized');
  });

  it('sends a signed-in user without role to /unauthorized', async () => {
    const router = setup(NO_ROLE);
    expect(urlOf(router, await run(roleGuard('STUDENT')))).toBe('/unauthorized');
  });

  it('redirects anonymous users to login instead of /unauthorized', async () => {
    const router = setup(null);
    expect(urlOf(router, await run(roleGuard('ADMIN'), '/admin'))).toBe(
      '/login?redirectTo=%2Fadmin',
    );
  });
});

describe('guestGuard', () => {
  it('lets anonymous users see the login page', async () => {
    setup(null);
    expect(await run(guestGuard, '/login')).toBe(true);
  });

  it('redirects signed-in users to the portal for their role', async () => {
    const router = setup(ADMIN);
    expect(urlOf(router, await run(guestGuard, '/login'))).toBe('/admin');
  });

  it('redirects signed-in users without role to /unauthorized', async () => {
    const router = setup(NO_ROLE);
    expect(urlOf(router, await run(guestGuard, '/login'))).toBe('/unauthorized');
  });
});
