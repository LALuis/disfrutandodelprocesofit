import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { doc } from 'firebase/firestore';
import { catchError, map, Observable, of, shareReplay } from 'rxjs';
import { documentData$ } from '@core/firebase/firestore.utils';
import { FIRESTORE } from '@core/firebase/firebase.tokens';
import { DEFAULT_GYM_SETTINGS, GymSettings } from '@shared/models/gym-settings';

export const GYM_SETTINGS_COLLECTION = 'gymSettings';
export const PUBLIC_SETTINGS_DOC = 'public';

/** Merges a raw document over the defaults, keeping only string fields the model knows. */
export function toGymSettings(data: Record<string, unknown> | null): GymSettings {
  if (!data) {
    return DEFAULT_GYM_SETTINGS;
  }
  const merged: Record<keyof GymSettings, string> = { ...DEFAULT_GYM_SETTINGS };
  for (const key of Object.keys(DEFAULT_GYM_SETTINGS) as (keyof GymSettings)[]) {
    const value = data[key];
    if (typeof value === 'string' && value.trim() !== '') {
      merged[key] = value;
    }
  }
  return merged;
}

@Injectable({ providedIn: 'root' })
export class GymSettingsService {
  private readonly firestore = inject(FIRESTORE);

  /**
   * Public settings with defaults applied. Errors fall back to the defaults too: branding
   * must never take the public site down.
   */
  readonly settings$: Observable<GymSettings> = documentData$(
    doc(this.firestore, GYM_SETTINGS_COLLECTION, PUBLIC_SETTINGS_DOC),
  ).pipe(
    map(toGymSettings),
    catchError(() => of(DEFAULT_GYM_SETTINGS)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /** Signal view of `settings$`, seeded with the defaults so templates can render immediately. */
  readonly settings = toSignal(this.settings$, { initialValue: DEFAULT_GYM_SETTINGS });
}
