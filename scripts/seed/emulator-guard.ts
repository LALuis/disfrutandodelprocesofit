import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface EmulatorTarget {
  readonly projectId: string;
  readonly authHost: string;
  readonly firestoreHost: string;
}

interface FirebaseJson {
  emulators?: Record<string, { host?: string; port?: number } | undefined>;
}

interface FirebaseRc {
  projects?: { default?: string };
}

const ROOT = resolve(import.meta.dirname, '../..');

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(resolve(ROOT, file), 'utf8')) as T;
}

/**
 * Resolves the emulator hosts from `firebase.json` / `.firebaserc` and refuses to continue
 * unless everything points at a local `demo-*` project. This is the safety net that keeps
 * the seed from ever touching a real Firebase project.
 */
export function resolveEmulatorTarget(): EmulatorTarget {
  const firebaseJson = readJson<FirebaseJson>('firebase.json');
  const firebaseRc = readJson<FirebaseRc>('.firebaserc');

  const projectId = process.env['GCLOUD_PROJECT'] ?? firebaseRc.projects?.default;
  if (!projectId || !projectId.startsWith('demo-')) {
    throw new Error(
      `Refusing to seed: project id "${projectId ?? '(none)'}" is not a demo-* emulator project.`,
    );
  }

  const auth = firebaseJson.emulators?.['auth'];
  const firestore = firebaseJson.emulators?.['firestore'];
  if (!auth?.port || !firestore?.port) {
    throw new Error(
      'Refusing to seed: auth/firestore emulators are not configured in firebase.json.',
    );
  }

  return {
    projectId,
    authHost: `${auth.host ?? '127.0.0.1'}:${auth.port}`,
    firestoreHost: `${firestore.host ?? '127.0.0.1'}:${firestore.port}`,
  };
}

/** Fails fast with a friendly message when the emulators are not running. */
export async function assertEmulatorsReachable(target: EmulatorTarget): Promise<void> {
  for (const [name, host] of [
    ['Auth', target.authHost],
    ['Firestore', target.firestoreHost],
  ] as const) {
    try {
      await fetch(`http://${host}/`);
    } catch {
      throw new Error(
        `${name} emulator is not reachable at ${host}. Start it with "npm run firebase:emulators".`,
      );
    }
  }
}

/** Points the Admin SDK at the emulators. Must run before `firebase-admin` is imported. */
export function applyEmulatorEnv(target: EmulatorTarget): void {
  process.env['GCLOUD_PROJECT'] = target.projectId;
  // Skip the GCE metadata credential lookup: the emulators accept unauthenticated Admin SDK calls.
  process.env['METADATA_SERVER_DETECTION'] = 'none';
  process.env['FIREBASE_AUTH_EMULATOR_HOST'] = target.authHost;
  process.env['FIRESTORE_EMULATOR_HOST'] = target.firestoreHost;
}
