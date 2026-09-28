import { inject, Injectable } from '@angular/core';
import {
  collection,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { map, Observable } from 'rxjs';
import { parseUserRole, UserRole } from '@core/auth/auth.models';
import {
  bool,
  collectionData$,
  converterFor,
  documentData$,
  record,
  str,
} from '@core/firebase/firestore.utils';
import { FIREBASE_FUNCTIONS, FIRESTORE } from '@core/firebase/firebase.tokens';
import {
  DEFAULT_FEATURES,
  UserFeatures,
  UserProfile,
  UserProfileUpdate,
} from '@shared/models/user-profile';

export const USERS_COLLECTION = 'users';

export function toUserProfile(id: string, data: Record<string, unknown>): UserProfile {
  const features = record(data, 'features');
  return {
    id,
    firstName: str(data, 'firstName'),
    lastName: str(data, 'lastName'),
    email: str(data, 'email'),
    phone: str(data, 'phone'),
    birthDate: str(data, 'birthDate'),
    active: bool(data, 'active'),
    joinDate: str(data, 'joinDate'),
    notes: str(data, 'notes'),
    role: parseUserRole(data['role']),
    features: {
      nutritionEnabled: bool(features, 'nutritionEnabled', DEFAULT_FEATURES.nutritionEnabled),
      recipesEnabled: bool(features, 'recipesEnabled', DEFAULT_FEATURES.recipesEnabled),
    },
    activeTrainingPlanId: str(data, 'activeTrainingPlanId') || null,
    activeNutritionPlanId: str(data, 'activeNutritionPlanId') || null,
  };
}

export const userProfileConverter = converterFor(toUserProfile);

export interface CreateStudentInput {
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly birthDate: string;
  readonly joinDate: string;
  readonly notes: string;
  readonly features: UserFeatures;
}

export interface CreateStudentResult {
  readonly uid: string;
  readonly passwordSetupLink: string;
}

/** Student administration. Privileged operations go through callable Cloud Functions. */
@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly firestore = inject(FIRESTORE);
  private readonly functions = inject(FIREBASE_FUNCTIONS);

  private readonly createStudentFn = httpsCallable<CreateStudentInput, CreateStudentResult>(
    this.functions,
    'createStudent',
  );
  private readonly setUserActiveFn = httpsCallable<
    { userId: string; active: boolean },
    { active: boolean }
  >(this.functions, 'setUserActive');
  private readonly setUserRoleFn = httpsCallable<
    { userId: string; role: UserRole },
    { role: UserRole }
  >(this.functions, 'setUserRole');

  private profileRef(userId: string) {
    return doc(this.firestore, USERS_COLLECTION, userId).withConverter(userProfileConverter);
  }

  /** All students ordered by last name; the list is small enough to filter client-side. */
  readonly students$: Observable<UserProfile[]> = collectionData$(
    query(
      collection(this.firestore, USERS_COLLECTION).withConverter(userProfileConverter),
      where('role', '==', 'STUDENT'),
      orderBy('lastName'),
      orderBy('firstName'),
    ),
  );

  readonly activeStudents$: Observable<UserProfile[]> = this.students$.pipe(
    map((students) => students.filter((s) => s.active)),
  );

  profile$(userId: string): Observable<UserProfile | null> {
    return documentData$(this.profileRef(userId));
  }

  async createStudent(input: CreateStudentInput): Promise<CreateStudentResult> {
    const result = await this.createStudentFn(input);
    return result.data;
  }

  async updateProfile(userId: string, changes: UserProfileUpdate): Promise<void> {
    await updateDoc(doc(this.firestore, USERS_COLLECTION, userId), {
      ...changes,
      updatedAt: serverTimestamp(),
    });
  }

  /** The only self-service profile edit allowed by the rules. */
  async updateOwnPhone(userId: string, phone: string): Promise<void> {
    await updateDoc(doc(this.firestore, USERS_COLLECTION, userId), {
      phone: phone.trim(),
      updatedAt: serverTimestamp(),
    });
  }

  async setActive(userId: string, active: boolean): Promise<void> {
    await this.setUserActiveFn({ userId, active });
  }

  async setRole(userId: string, role: UserRole): Promise<void> {
    await this.setUserRoleFn({ userId, role });
  }
}
