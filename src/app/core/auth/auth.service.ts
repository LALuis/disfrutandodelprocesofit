import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { onIdTokenChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { Observable, ReplaySubject } from 'rxjs';
import { FIREBASE_AUTH } from '@core/firebase/firebase.tokens';
import { AuthUser, parseUserRole, ROLE_CLAIM } from './auth.models';

/**
 * Single source of truth for the authenticated user and their role.
 *
 * Exposes the state both as signals (for templates and component logic) and as an
 * observable that replays the last value (for guards that must wait for the initial
 * Firebase Auth resolution before deciding).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(FIREBASE_AUTH);
  private readonly state$ = new ReplaySubject<AuthUser | null>(1);
  /** Guards against out-of-order async token resolutions. */
  private resolutionSeq = 0;

  private readonly userState = signal<AuthUser | null>(null);
  private readonly readyState = signal(false);

  /** Emits the current user after every token change; replays the last value. */
  readonly authState$: Observable<AuthUser | null> = this.state$.asObservable();

  readonly user = this.userState.asReadonly();
  /** False until Firebase resolves the persisted session for the first time. */
  readonly ready = this.readyState.asReadonly();
  readonly isAuthenticated = computed(() => this.userState() !== null);
  readonly role = computed(() => this.userState()?.role ?? null);
  readonly isAdmin = computed(() => this.role() === 'ADMIN');
  readonly isStudent = computed(() => this.role() === 'STUDENT');

  constructor() {
    const unsubscribe = onIdTokenChanged(this.auth, (firebaseUser) => {
      void this.resolve(firebaseUser);
    });
    inject(DestroyRef).onDestroy(unsubscribe);
  }

  async signIn(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email.trim(), password);
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
  }

  /** Forces a token refresh so recently changed custom claims become visible. */
  async refreshClaims(): Promise<void> {
    await this.auth.currentUser?.getIdToken(true);
  }

  private async resolve(firebaseUser: User | null): Promise<void> {
    const seq = ++this.resolutionSeq;
    const next = firebaseUser ? await toAuthUser(firebaseUser) : null;
    if (seq !== this.resolutionSeq) {
      return;
    }
    this.userState.set(next);
    this.readyState.set(true);
    this.state$.next(next);
  }
}

async function toAuthUser(user: User): Promise<AuthUser> {
  const token = await user.getIdTokenResult();
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: parseUserRole(token.claims[ROLE_CLAIM]),
  };
}
