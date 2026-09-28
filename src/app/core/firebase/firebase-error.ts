import { FirebaseError } from 'firebase/app';

const GENERIC = 'Ocurrió un error inesperado. Intentá de nuevo en unos minutos.';

const CODE_MESSAGES: Record<string, string> = {
  'permission-denied': 'No tenés permisos para realizar esta acción.',
  'functions/permission-denied': 'No tenés permisos para realizar esta acción.',
  'functions/unauthenticated': 'Tu sesión expiró. Volvé a ingresar.',
  unavailable: 'No pudimos conectarnos. Revisá tu conexión a internet.',
  'functions/unavailable': 'No pudimos conectarnos. Revisá tu conexión a internet.',
  'storage/unauthorized': 'No tenés permisos para subir este archivo.',
  'storage/canceled': 'La subida fue cancelada.',
};

/**
 * User-facing message for Firestore / Functions / Storage errors.
 * Callable functions return curated Spanish messages, which are surfaced as-is except for
 * internal failures; every other error falls back to a generic message.
 */
export function messageFromError(error: unknown, fallback = GENERIC): string {
  if (error instanceof FirebaseError) {
    const mapped = CODE_MESSAGES[error.code];
    if (mapped) {
      return mapped;
    }
    if (error.code.startsWith('functions/') && error.code !== 'functions/internal') {
      return error.message || fallback;
    }
    return fallback;
  }
  if (error instanceof Error && error.message && !error.message.startsWith('Firebase')) {
    return error.message;
  }
  return fallback;
}
