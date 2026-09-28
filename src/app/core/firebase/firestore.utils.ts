import {
  DocumentData,
  DocumentReference,
  FirestoreDataConverter,
  onSnapshot,
  Query,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { Observable } from 'rxjs';

/**
 * Thin RxJS wrappers over Firestore realtime listeners. The listener is detached when the
 * observable is unsubscribed, so components can combine them with `rxResource`/`toSignal`
 * without leaking subscriptions.
 */
export function collectionData$<T>(query: Query<T>): Observable<T[]> {
  return new Observable<T[]>((subscriber) =>
    onSnapshot(
      query,
      (snapshot) => subscriber.next(snapshot.docs.map((doc) => doc.data())),
      (error) => subscriber.error(error),
    ),
  );
}

/** Emits `null` when the document does not exist. */
export function documentData$<T extends DocumentData>(
  ref: DocumentReference<T>,
): Observable<T | null> {
  return new Observable<T | null>((subscriber) =>
    onSnapshot(
      ref,
      (snapshot) => subscriber.next(snapshot.exists() ? snapshot.data() : null),
      (error) => subscriber.error(error),
    ),
  );
}

/**
 * Builds a converter from a normalising `fromDoc` function. On write the `id` field is
 * stripped (it is the document key) and `undefined` values are dropped by the SDK config.
 */
export function converterFor<T extends { readonly id: string }>(
  fromDoc: (id: string, data: Record<string, unknown>) => T,
): FirestoreDataConverter<T> {
  return {
    toFirestore: ({ id: _id, ...data }: T) => data,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => fromDoc(snapshot.id, snapshot.data()),
  };
}

// ---- Field readers used by the normalisers ---------------------------------

export function str(data: Record<string, unknown>, key: string, fallback = ''): string {
  const value = data[key];
  return typeof value === 'string' ? value : fallback;
}

export function num(data: Record<string, unknown>, key: string, fallback = 0): number {
  const value = data[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function numOrNull(data: Record<string, unknown>, key: string): number | null {
  const value = data[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function bool(data: Record<string, unknown>, key: string, fallback = false): boolean {
  const value = data[key];
  return typeof value === 'boolean' ? value : fallback;
}

export function strArray(data: Record<string, unknown>, key: string): string[] {
  const value = data[key];
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

export function record(data: Record<string, unknown>, key: string): Record<string, unknown> {
  const value = data[key];
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function recordArray(data: Record<string, unknown>, key: string): Record<string, unknown>[] {
  const value = data[key];
  return Array.isArray(value)
    ? value.filter(
        (v): v is Record<string, unknown> =>
          typeof v === 'object' && v !== null && !Array.isArray(v),
      )
    : [];
}

export function oneOf<T extends string>(
  data: Record<string, unknown>,
  key: string,
  options: readonly T[],
  fallback: T,
): T {
  const value = data[key];
  return options.includes(value as T) ? (value as T) : fallback;
}
