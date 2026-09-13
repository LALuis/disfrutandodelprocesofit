import { AppEnvironment } from './environment.model';

/**
 * Local development environment: 100% Firebase Emulator Suite.
 * The `demo-` project id prefix guarantees the emulators never talk to a real project.
 * Ports must match the `emulators` block in `firebase.json`.
 */
export const environment: AppEnvironment = {
  production: false,
  useEmulators: true,
  firebase: {
    apiKey: 'demo-api-key',
    authDomain: 'demo-disfrutando-fit.firebaseapp.com',
    projectId: 'demo-disfrutando-fit',
    storageBucket: 'demo-disfrutando-fit.appspot.com',
    messagingSenderId: '000000000000',
    appId: '1:000000000000:web:0000000000000000',
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
