import { inject, Injectable } from '@angular/core';
import {
  collection,
  FirestoreDataConverter,
  query,
  QueryDocumentSnapshot,
  where,
} from 'firebase/firestore';
import { map, Observable, shareReplay } from 'rxjs';
import { collectionData$ } from '@core/firebase/firestore.utils';
import { FIRESTORE } from '@core/firebase/firebase.tokens';
import { MembershipPlan, PLAN_FREQUENCIES, PlanFrequency } from '@shared/models/membership-plan';

export const MEMBERSHIP_PLANS_COLLECTION = 'membershipPlans';

/** Normalises raw documents so a malformed record can never break the public site. */
export function toMembershipPlan(id: string, data: Record<string, unknown>): MembershipPlan {
  const frequency = data['frequency'];
  return {
    id,
    name: typeof data['name'] === 'string' ? data['name'] : '',
    description: typeof data['description'] === 'string' ? data['description'] : '',
    price: typeof data['price'] === 'number' ? data['price'] : 0,
    currency: typeof data['currency'] === 'string' ? data['currency'] : 'UYU',
    frequency: PLAN_FREQUENCIES.includes(frequency as PlanFrequency)
      ? (frequency as PlanFrequency)
      : 'monthly',
    features: Array.isArray(data['features'])
      ? data['features'].filter((f): f is string => typeof f === 'string')
      : [],
    highlighted: data['highlighted'] === true,
    active: data['active'] === true,
    displayOrder: typeof data['displayOrder'] === 'number' ? data['displayOrder'] : 0,
  };
}

const membershipPlanConverter: FirestoreDataConverter<MembershipPlan> = {
  toFirestore: ({ id: _id, ...plan }) => plan,
  fromFirestore: (snapshot: QueryDocumentSnapshot) =>
    toMembershipPlan(snapshot.id, snapshot.data()),
};

export function sortPlans(plans: readonly MembershipPlan[]): MembershipPlan[] {
  return [...plans].sort(
    (a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name, 'es'),
  );
}

@Injectable({ providedIn: 'root' })
export class MembershipPlansService {
  private readonly firestore = inject(FIRESTORE);

  /**
   * Active plans for the public site, ordered by `displayOrder`.
   * Sorting is done client-side to avoid a composite index for a handful of documents;
   * the `active == true` filter is required by the security rules for anonymous reads.
   */
  readonly activePlans$: Observable<MembershipPlan[]> = collectionData$(
    query(
      collection(this.firestore, MEMBERSHIP_PLANS_COLLECTION).withConverter(
        membershipPlanConverter,
      ),
      where('active', '==', true),
    ),
  ).pipe(map(sortPlans), shareReplay({ bufferSize: 1, refCount: true }));
}
