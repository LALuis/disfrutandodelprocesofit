import { signal } from '@angular/core';
import type { MockInstance } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { BehaviorSubject } from 'rxjs';
import { AuthUser } from '@core/auth/auth.models';
import { AuthService } from '@core/auth/auth.service';
import { LoginPage } from './login-page';

const STUDENT: AuthUser = { uid: 's', email: 'st@gym.local', displayName: null, role: 'STUDENT' };

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let authState$: BehaviorSubject<AuthUser | null>;
  let signIn: ReturnType<typeof vi.fn>;
  let navigateByUrl: MockInstance<Router['navigateByUrl']>;

  function element<T extends HTMLElement>(selector: string): T {
    const el = fixture.nativeElement.querySelector(selector) as T | null;
    if (!el) {
      throw new Error(`Element not found: ${selector}`);
    }
    return el;
  }

  async function fill(email: string, password: string): Promise<void> {
    const emailInput = element<HTMLInputElement>('#login-email');
    const passwordInput = element<HTMLInputElement>('#login-password');
    emailInput.value = email;
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = password;
    passwordInput.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function submit(): Promise<void> {
    element<HTMLFormElement>('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    await fixture.whenStable();
  }

  async function create(redirectTo?: string): Promise<void> {
    authState$ = new BehaviorSubject<AuthUser | null>(null);
    signIn = vi.fn();
    const authServiceStub = {
      authState$,
      signIn,
      user: signal<AuthUser | null>(null),
      isAuthenticated: signal(false),
      role: signal(null),
    };
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceStub },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap(redirectTo ? { redirectTo } : {}) },
          },
        },
      ],
    }).compileComponents();
    navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(LoginPage);
    await fixture.whenStable();
  }

  it('shows validation errors and does not call Firebase when the form is invalid', async () => {
    await create();
    await fill('not-an-email', '');
    await submit();

    expect(signIn).not.toHaveBeenCalled();
    expect(element('#login-email-error').textContent).toContain('no es válido');
    expect(element('#login-password-error').textContent).toContain('contraseña');
  });

  it('signs in and navigates to the portal that matches the role', async () => {
    await create();
    signIn.mockImplementation(async () => {
      authState$.next(STUDENT);
    });
    await fill('st@gym.local', 'demo1234');
    await submit();

    expect(signIn).toHaveBeenCalledWith('st@gym.local', 'demo1234');
    expect(navigateByUrl).toHaveBeenCalledWith('/app');
  });

  it('honours a safe redirectTo query param and ignores external ones', async () => {
    await create('/app/agenda');
    signIn.mockImplementation(async () => authState$.next(STUDENT));
    await fill('st@gym.local', 'demo1234');
    await submit();
    expect(navigateByUrl).toHaveBeenCalledWith('/app/agenda');

    TestBed.resetTestingModule();
    await create('https://evil.example');
    signIn.mockImplementation(async () => authState$.next(STUDENT));
    await fill('st@gym.local', 'demo1234');
    await submit();
    expect(navigateByUrl).toHaveBeenCalledWith('/app');
  });

  it('renders a friendly message when Firebase rejects the credentials', async () => {
    await create();
    signIn.mockRejectedValue(new FirebaseError('auth/invalid-credential', 'nope'));
    await fill('st@gym.local', 'wrong');
    await submit();

    expect(navigateByUrl).not.toHaveBeenCalled();
    expect(element('[role="alert"].login__error').textContent).toContain(
      'Email o contraseña incorrectos',
    );
    expect(element<HTMLButtonElement>('button[type="submit"]').disabled).toBe(false);
  });
});
