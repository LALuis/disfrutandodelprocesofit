import {
  DocumentData,
  DocumentReference,
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
export function collectionData$<T>(
  query: Query<T>,
  mapDoc: (snapshot: QueryDocumentSnapshot<T>) => T = (snapshot) => snapshot.data(),
): Observable<T[]> {
  return new Observable<T[]>((subscriber) =>
    onSnapshot(
      query,
      (snapshot) => subscriber.next(snapshot.docs.map(mapDoc)),
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
