/**
 * Firebase web app configuration. These values are NOT secrets (they ship to the browser),
 * but the production ones must never be committed: fill them in at deploy time.
 */
export interface FirebaseWebConfig {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly storageBucket: string;
  readonly messagingSenderId: string;
  readonly appId: string;
}

/** Host/port of each emulator the frontend connects to when `useEmulators` is true. */
export interface EmulatorConfig {
  readonly host: string;
  readonly authPort: number;
  readonly firestorePort: number;
  readonly functionsPort: number;
  readonly storagePort: number;
}

export interface AppEnvironment {
  readonly production: boolean;
  /** When true the SDKs are pointed at the local Firebase Emulator Suite. */
  readonly useEmulators: boolean;
  readonly firebase: FirebaseWebConfig;
  /** Region where callable Cloud Functions are deployed. */
  readonly functionsRegion: string;
  readonly emulators: EmulatorConfig;
}
