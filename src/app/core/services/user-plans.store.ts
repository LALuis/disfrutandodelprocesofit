import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  FirestoreDataConverter,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
  WriteBatch,
  writeBatch,
} from 'firebase/firestore';
import { map, Observable } from 'rxjs';
import { collectionData$, documentData$ } from '@core/firebase/firestore.utils';
import { USERS_COLLECTION } from './users.service';

interface PlanLike {
  readonly id: string;
  readonly active: boolean;
  readonly startDate: string;
}

/**
 * Shared persistence for per-user plan subcollections (training, nutrition).
 * Guarantees a single active plan per user and keeps a pointer on the profile document
 * (`pointerField`) so dashboards can show the active plan without an extra query.
 */
export class UserPlansStore<T extends PlanLike> {
  constructor(
    private readonly firestore: Firestore,
    private readonly collectionName: string,
    private readonly converter: FirestoreDataConverter<T>,
    private readonly pointerField: 'activeTrainingPlanId' | 'activeNutritionPlanId',
  ) {}

  private collectionRef(userId: string) {
    return collection(this.firestore, USERS_COLLECTION, userId, this.collectionName);
  }

  /** Newest first. */
  list$(userId: string): Observable<T[]> {
    return collectionData$(
      query(this.collectionRef(userId).withConverter(this.converter), orderBy('startDate', 'desc')),
    );
  }

  get$(userId: string, planId: string): Observable<T | null> {
    return documentData$(doc(this.collectionRef(userId), planId).withConverter(this.converter));
  }

  active$(userId: string): Observable<T | null> {
    return this.list$(userId).pipe(map((plans) => plans.find((p) => p.active) ?? null));
  }

  /** Creates or updates a plan; when `active`, every other plan is deactivated atomically. */
  async save(userId: string, input: Omit<T, 'id'>, planId?: string): Promise<string> {
    const ref = planId ? doc(this.collectionRef(userId), planId) : doc(this.collectionRef(userId));
    const batch = writeBatch(this.firestore);
    batch.set(ref, { ...input, updatedAt: serverTimestamp() }, { merge: true });
    await this.applyActivation(userId, ref.id, input.active, batch);
    await batch.commit();
    return ref.id;
  }

  async setActive(userId: string, planId: string, active: boolean): Promise<void> {
    const batch = writeBatch(this.firestore);
    batch.update(doc(this.collectionRef(userId), planId), { active, updatedAt: serverTimestamp() });
    await this.applyActivation(userId, planId, active, batch);
    await batch.commit();
  }

  async remove(userId: string, planId: string): Promise<void> {
    await deleteDoc(doc(this.collectionRef(userId), planId));
  }

  private async applyActivation(
    userId: string,
    planId: string,
    active: boolean,
    batch: WriteBatch,
  ): Promise<void> {
    if (active) {
      const others = await getDocs(query(this.collectionRef(userId), where('active', '==', true)));
      others.docs
        .filter((d) => d.id !== planId)
        .forEach((d) => batch.update(d.ref, { active: false, updatedAt: serverTimestamp() }));
    }
    batch.update(doc(this.firestore, USERS_COLLECTION, userId), {
      [this.pointerField]: active ? planId : null,
      updatedAt: serverTimestamp(),
    });
  }
}
