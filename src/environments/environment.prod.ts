import { AppEnvironment } from './environment.model';

/**
 * Production environment.
 *
 * Replace every `REPLACE_ME` value with the web app config of YOUR Firebase project
 * (Firebase console → Project settings → Your apps → SDK setup and configuration).
 * Do this right before building for production; never commit real values.
 */
export const environment: AppEnvironment = {
  production: true,
  useEmulators: false,
  firebase: {
    apiKey: 'REPLACE_ME',
    authDomain: 'REPLACE_ME.firebaseapp.com',
    projectId: 'REPLACE_ME',
    storageBucket: 'REPLACE_ME.appspot.com',
    messagingSenderId: 'REPLACE_ME',
    appId: 'REPLACE_ME',
  },
  functionsRegion: 'us-central1',
  emulators: {
    host: '127.0.0.1',
    authPort: 9099,
    firestorePort: 8080,
    functionsPort: 5001,
    storagePort: 9199,
  },
};
