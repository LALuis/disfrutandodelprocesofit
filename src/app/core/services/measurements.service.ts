import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { collectionData$, converterFor, numOrNull, str } from '@core/firebase/firestore.utils';
import { FIRESTORE } from '@core/firebase/firebase.tokens';
import {
  Measurement,
  MEASUREMENT_METRICS,
  MeasurementInput,
  MeasurementValues,
} from '@shared/models/measurement';
import { USERS_COLLECTION } from './users.service';

export const MEASUREMENTS_COLLECTION = 'measurements';

export function toMeasurement(id: string, data: Record<string, unknown>): Measurement {
  const values = Object.fromEntries(
    MEASUREMENT_METRICS.map((metric) => [metric, numOrNull(data, metric)]),
  ) as MeasurementValues;
  return { id, date: str(data, 'date'), notes: str(data, 'notes'), ...values };
}

const measurementConverter = converterFor(toMeasurement);

/** Append-only measurement history under `users/{uid}/measurements`. */
@Injectable({ providedIn: 'root' })
export class MeasurementsService {
  private readonly firestore = inject(FIRESTORE);

  private collectionRef(userId: string) {
    return collection(this.firestore, USERS_COLLECTION, userId, MEASUREMENTS_COLLECTION);
  }

  /** Newest first. */
  history$(userId: string): Observable<Measurement[]> {
    return collectionData$(
      query(
        this.collectionRef(userId).withConverter(measurementConverter),
        orderBy('date', 'desc'),
      ),
    );
  }

  async add(userId: string, input: MeasurementInput): Promise<void> {
    await addDoc(this.collectionRef(userId), { ...input, createdAt: serverTimestamp() });
  }

  async remove(userId: string, measurementId: string): Promise<void> {
    await deleteDoc(doc(this.collectionRef(userId), measurementId));
  }
}
