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
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Observable } from 'rxjs';
import {
  bool,
  collectionData$,
  converterFor,
  documentData$,
  num,
  numOrNull,
  oneOf,
  str,
  strArray,
} from '@core/firebase/firestore.utils';
import { FIREBASE_STORAGE, FIRESTORE } from '@core/firebase/firebase.tokens';
import { Recipe, RECIPE_CATEGORIES, RecipeInput } from '@shared/models/recipe';

export const RECIPES_COLLECTION = 'recipes';
const RECIPE_IMAGES_FOLDER = 'recipes';
export const MAX_RECIPE_IMAGE_BYTES = 5 * 1024 * 1024;

export function toRecipe(id: string, data: Record<string, unknown>): Recipe {
  return {
    id,
    title: str(data, 'title'),
    description: str(data, 'description'),
    imageUrl: str(data, 'imageUrl'),
    imagePath: str(data, 'imagePath'),
    ingredients: strArray(data, 'ingredients'),
    instructions: strArray(data, 'instructions'),
    preparationTime: num(data, 'preparationTime'),
    calories: numOrNull(data, 'calories'),
    protein: numOrNull(data, 'protein'),
    carbohydrates: numOrNull(data, 'carbohydrates'),
    fat: numOrNull(data, 'fat'),
    category: oneOf(data, 'category', RECIPE_CATEGORIES, 'lunch'),
    tags: strArray(data, 'tags'),
    active: bool(data, 'active'),
  };
}

const recipeConverter = converterFor(toRecipe);

/** Recipe library (Firestore) + images (Storage `recipes/`). */
@Injectable({ providedIn: 'root' })
export class RecipesService {
  private readonly firestore = inject(FIRESTORE);
  private readonly storage = inject(FIREBASE_STORAGE);

  private get collectionRef() {
    return collection(this.firestore, RECIPES_COLLECTION);
  }

  /** Published recipes; the `active` filter is required by the rules for students. */
  activeRecipes$(): Observable<Recipe[]> {
    return collectionData$(
      query(
        this.collectionRef.withConverter(recipeConverter),
        where('active', '==', true),
        orderBy('title'),
      ),
    );
  }

  /** Every recipe including archived ones (admin). */
  allRecipes$(): Observable<Recipe[]> {
    return collectionData$(
      query(this.collectionRef.withConverter(recipeConverter), orderBy('title')),
    );
  }

  recipe$(recipeId: string): Observable<Recipe | null> {
    return documentData$(doc(this.collectionRef, recipeId).withConverter(recipeConverter));
  }

  /** Creates or updates a recipe. Returns the document id. */
  async save(input: RecipeInput, recipeId?: string): Promise<string> {
    const target = recipeId ? doc(this.collectionRef, recipeId) : doc(this.collectionRef);
    await setDoc(target, { ...input, updatedAt: serverTimestamp() }, { merge: true });
    return target.id;
  }

  async setActive(recipeId: string, active: boolean): Promise<void> {
    await setDoc(
      doc(this.collectionRef, recipeId),
      { active, updatedAt: serverTimestamp() },
      { merge: true },
    );
  }

  async remove(recipe: Recipe): Promise<void> {
    await deleteDoc(doc(this.collectionRef, recipe.id));
    if (recipe.imagePath) {
      await this.deleteImage(recipe.imagePath);
    }
  }

  /** Uploads an image and returns its public URL and storage path. */
  async uploadImage(file: File): Promise<{ imageUrl: string; imagePath: string }> {
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen.');
    }
    if (file.size > MAX_RECIPE_IMAGE_BYTES) {
      throw new Error('La imagen no puede superar los 5 MB.');
    }
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const imagePath = `${RECIPE_IMAGES_FOLDER}/${crypto.randomUUID()}.${extension}`;
    const storageRef = ref(this.storage, imagePath);
    await uploadBytes(storageRef, file, { contentType: file.type });
    return { imageUrl: await getDownloadURL(storageRef), imagePath };
  }

  async deleteImage(imagePath: string): Promise<void> {
    try {
      await deleteObject(ref(this.storage, imagePath));
    } catch {
      // A missing object is not an error worth surfacing: the recipe is already detached.
    }
  }
}
