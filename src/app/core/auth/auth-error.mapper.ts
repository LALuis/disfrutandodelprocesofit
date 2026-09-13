import { FirebaseError } from 'firebase/app';

const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/invalid-email': 'El email no tiene un formato válido.',
  'auth/user-not-found': 'Email o contraseña incorrectos.',
  'auth/wrong-password': 'Email o contraseña incorrectos.',
  'auth/user-disabled': 'Tu cuenta está deshabilitada. Comunicate con el gimnasio.',
  'auth/too-many-requests': 'Demasiados intentos. Esperá unos minutos y volvé a probar.',
  'auth/network-request-failed': 'No pudimos conectarnos. Revisá tu conexión a internet.',
};

const DEFAULT_MESSAGE = 'Ocurrió un error inesperado. Intentá de nuevo en unos minutos.';

/** Translates Firebase Auth errors into user-facing Spanish messages. */
export function mapAuthError(error: unknown): string {
  if (error instanceof FirebaseError) {
    return MESSAGES[error.code] ?? DEFAULT_MESSAGE;
  }
  return DEFAULT_MESSAGE;
}
