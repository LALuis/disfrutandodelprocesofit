import { TestBed } from '@angular/core/testing';
import type { Auth, IdTokenResult, User } from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { FIREBASE_AUTH } from '@core/firebase/firebase.tokens';
import { AuthService } from './auth.service';

type TokenListener = (user: User | null) => void;

const listeners: TokenListener[] = [];
const signInMock = vi.fn();
const signOutMock = vi.fn();

vi.mock('firebase/auth', () => ({
  onIdTokenChanged: (_auth: Auth, next: TokenListener) => {
    listeners.push(next);
    return () => listeners.splice(listeners.indexOf(next), 1);
  },
  signInWithEmailAndPassword: (...args: unknown[]) => signInMock(...args),
  signOut: (...args: unknown[]) => signOutMock(...args),
}));

function fakeUser(claims: Record<string, unknown>, uid = 'uid-1'): User {
  return {
    uid,
    email: `${uid}@gym.local`,
    displayName: null,
    getIdTokenResult: () => Promise.resolve({ claims } as unknown as IdTokenResult),
  } as unknown as User;
}

async function emit(user: User | null): Promise<void> {
  listeners.forEach((listener) => listener(user));
  await Promise.resolve();
  await Promise.resolve();
}

describe('AuthService', () => {
  const fakeAuth = { currentUser: null } as unknown as Auth;
  let service: AuthService;

  beforeEach(() => {
    listeners.length = 0;
    signInMock.mockReset();
    signOutMock.mockReset();
    TestBed.configureTestingModule({ providers: [{ provide: FIREBASE_AUTH, useValue: fakeAuth }] });
    service = TestBed.inject(AuthService);
  });

  it('is not ready and has no user until Firebase resolves the session', () => {
    expect(service.ready()).toBe(false);
    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('becomes ready with a null user when nobody is signed in', async () => {
    await emit(null);
    expect(service.ready()).toBe(true);
    expect(service.user()).toBeNull();
    expect(await firstValueFrom(service.authState$)).toBeNull();
  });

  it('exposes the role from the custom claim', async () => {
    await emit(fakeUser({ role: 'ADMIN' }));
    expect(service.isAuthenticated()).toBe(true);
    expect(service.role()).toBe('ADMIN');
    expect(service.isAdmin()).toBe(true);
    expect(service.isStudent()).toBe(false);
  });

  it('treats unknown or missing role claims as no role', async () => {
    await emit(fakeUser({ role: 'ROOT' }));
    expect(service.role()).toBeNull();
    await emit(fakeUser({}));
    expect(service.role()).toBeNull();
    expect(service.isAuthenticated()).toBe(true);
  });

  it('replays the latest state to late subscribers (guards)', async () => {
    await emit(fakeUser({ role: 'STUDENT' }));
    const state = await firstValueFrom(service.authState$);
    expect(state?.role).toBe('STUDENT');
  });

  it('trims the email before signing in and delegates sign out', async () => {
    signInMock.mockResolvedValue(undefined);
    await service.signIn('  admin@gym.local ', 'secret');
    expect(signInMock).toHaveBeenCalledWith(fakeAuth, 'admin@gym.local', 'secret');

    signOutMock.mockResolvedValue(undefined);
    await service.signOut();
    expect(signOutMock).toHaveBeenCalledWith(fakeAuth);
  });
});
