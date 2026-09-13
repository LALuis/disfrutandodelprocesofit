import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, initializeFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { AppEnvironment } from '@env/environment.model';
import {
  APP_ENVIRONMENT,
  FIREBASE_APP,
  FIREBASE_AUTH,
  FIREBASE_FUNCTIONS,
  FIREBASE_STORAGE,
  FIRESTORE,
} from './firebase.tokens';

/**
 * Registers the Firebase app and every SDK the frontend uses.
 * When `env.useEmulators` is true each SDK is pointed at the local Emulator Suite,
 * so switching between local and production is a single configuration flag.
 */
export function provideFirebase(env: AppEnvironment): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: APP_ENVIRONMENT, useValue: env },
    { provide: FIREBASE_APP, useFactory: () => initializeApp(env.firebase) },
    {
      provide: FIREBASE_AUTH,
      useFactory: () => {
        const auth = getAuth(inject(FIREBASE_APP));
        if (env.useEmulators) {
          const { host, authPort } = env.emulators;
          connectAuthEmulator(auth, `http://${host}:${authPort}`, { disableWarnings: true });
        }
        return auth;
      },
    },
    {
      provide: FIRESTORE,
      useFactory: () => {
        const firestore = initializeFirestore(inject(FIREBASE_APP), {
          ignoreUndefinedProperties: true,
        });
        if (env.useEmulators) {
          const { host, firestorePort } = env.emulators;
          connectFirestoreEmulator(firestore, host, firestorePort);
        }
        return firestore;
      },
    },
    {
      provide: FIREBASE_FUNCTIONS,
      useFactory: () => {
        const functions = getFunctions(inject(FIREBASE_APP), env.functionsRegion);
        if (env.useEmulators) {
          const { host, functionsPort } = env.emulators;
          connectFunctionsEmulator(functions, host, functionsPort);
        }
        return functions;
      },
    },
    {
      provide: FIREBASE_STORAGE,
      useFactory: () => {
        const storage = getStorage(inject(FIREBASE_APP));
        if (env.useEmulators) {
          const { host, storagePort } = env.emulators;
          connectStorageEmulator(storage, host, storagePort);
        }
        return storage;
      },
    },
  ]);
}
