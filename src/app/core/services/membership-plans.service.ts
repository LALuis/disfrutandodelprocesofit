import { inject, Injectable } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { map, Observable, shareReplay } from 'rxjs';
import { collectionData$, converterFor } from '@core/firebase/firestore.utils';
import { FIRESTORE } from '@core/firebase/firebase.tokens';
import {
  MembershipPlan,
  MembershipPlanInput,
  PLAN_FREQUENCIES,
  PlanFrequency,
} from '@shared/models/membership-plan';

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

const membershipPlanConverter = converterFor(toMembershipPlan);

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

  /** Every plan, including inactive ones (admin). */
  readonly allPlans$: Observable<MembershipPlan[]> = collectionData$(
    query(
      collection(this.firestore, MEMBERSHIP_PLANS_COLLECTION).withConverter(
        membershipPlanConverter,
      ),
      orderBy('displayOrder'),
    ),
  );

  async save(input: MembershipPlanInput, planId?: string): Promise<string> {
    const target = planId
      ? doc(this.firestore, MEMBERSHIP_PLANS_COLLECTION, planId)
      : doc(collection(this.firestore, MEMBERSHIP_PLANS_COLLECTION));
    await setDoc(target, { ...input, updatedAt: serverTimestamp() }, { merge: true });
    return target.id;
  }

  async remove(planId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, MEMBERSHIP_PLANS_COLLECTION, planId));
  }
}
