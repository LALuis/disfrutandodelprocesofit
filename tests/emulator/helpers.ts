import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';

const ROOT = resolve(import.meta.dirname, '../..');

interface EmulatorPorts {
  readonly host: string;
  readonly auth: number;
  readonly firestore: number;
  readonly functions: number;
  readonly storage: number;
}

interface FirebaseJson {
  emulators: Record<string, { host?: string; port: number }>;
}

/** Ports come from `firebase.json` so the tests always match the local configuration. */
export const PORTS: EmulatorPorts = (() => {
  const json = JSON.parse(readFileSync(resolve(ROOT, 'firebase.json'), 'utf8')) as FirebaseJson;
  return {
    host: json.emulators['firestore'].host ?? '127.0.0.1',
    auth: json.emulators['auth'].port,
    firestore: json.emulators['firestore'].port,
    functions: json.emulators['functions'].port,
    storage: json.emulators['storage'].port,
  };
})();

export const PROJECT_ID = 'demo-disfrutando-fit';

/** Auth token shapes accepted by `env.authenticatedContext`. */
export const ADMIN_TOKEN = { role: 'ADMIN' };
export const STUDENT_TOKEN = { role: 'STUDENT' };

export async function createRulesEnvironment(): Promise<RulesTestEnvironment> {
  return initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: PORTS.host,
      port: PORTS.firestore,
      rules: readFileSync(resolve(ROOT, 'firestore.rules'), 'utf8'),
    },
    storage: {
      host: PORTS.host,
      port: PORTS.storage,
      rules: readFileSync(resolve(ROOT, 'storage.rules'), 'utf8'),
    },
  });
}

export const FUTURE = Date.now() + 24 * 60 * 60 * 1000;
export const PAST = Date.now() - 60 * 60 * 1000;

export function slotDoc(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    date: '2099-01-01',
    startTime: '08:00',
    durationMinutes: 60,
    startsAt: FUTURE,
    capacity: 2,
    bookedCount: 0,
    enabled: true,
    ...overrides,
  };
}

export function profileDoc(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@gym.local',
    phone: '',
    birthDate: '',
    joinDate: '2026-01-01',
    notes: '',
    role: 'STUDENT',
    active: true,
    features: { nutritionEnabled: false, recipesEnabled: false },
    activeTrainingPlanId: null,
    activeNutritionPlanId: null,
    ...overrides,
  };
}
