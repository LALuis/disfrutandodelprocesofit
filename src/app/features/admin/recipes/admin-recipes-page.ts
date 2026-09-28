import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { messageFromError } from '@core/firebase/firebase-error';
import { RecipesService } from '@core/services/recipes.service';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { Card } from '@shared/components/card/card';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { Icon } from '@shared/components/icon/icon';
import { LoadingState } from '@shared/components/loading-state/loading-state';
import { PageHeader } from '@shared/components/page-header/page-header';
import { Recipe, RECIPE_CATEGORY_LABELS, RecipeInput } from '@shared/models/recipe';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { ToastService } from '@shared/services/toast.service';
import { RecipeForm } from './recipe-form';

@Component({
  selector: 'app-admin-recipes-page',
  imports: [
    PageHeader,
    Card,
    Button,
    Icon,
    Badge,
    LoadingState,
    ErrorState,
    EmptyState,
    RecipeForm,
  ],
  templateUrl: './admin-recipes-page.html',
  styleUrl: './admin-recipes-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminRecipesPage {
  private readonly recipesService = inject(RecipesService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  protected readonly categoryLabels = RECIPE_CATEGORY_LABELS;
  protected readonly search = signal('');
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  /** `undefined` = closed, `null` = creating, recipe = editing. */
  protected readonly editing = signal<Recipe | null | undefined>(undefined);

  protected readonly recipes = rxResource({ stream: () => this.recipesService.allRecipes$() });

  protected readonly filtered = computed(() => {
    const needle = this.search().trim().toLowerCase();
    const all = this.recipes.hasValue() ? this.recipes.value() : [];
    return needle
      ? all.filter((r) =>
          `${r.title} ${r.tags.join(' ')} ${RECIPE_CATEGORY_LABELS[r.category]}`
            .toLowerCase()
            .includes(needle),
        )
      : all;
  });

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected openCreate(): void {
    this.errorMessage.set('');
    this.editing.set(null);
  }

  protected openEdit(recipe: Recipe): void {
    this.errorMessage.set('');
    this.editing.set(recipe);
  }

  protected async save(input: RecipeInput): Promise<void> {
    this.submitting.set(true);
    this.errorMessage.set('');
    try {
      await this.recipesService.save(input, this.editing()?.id);
      this.toast.success('Receta guardada.');
      this.editing.set(undefined);
    } catch (error) {
      this.errorMessage.set(messageFromError(error));
    } finally {
      this.submitting.set(false);
    }
  }

  protected async toggleActive(recipe: Recipe): Promise<void> {
    try {
      await this.recipesService.setActive(recipe.id, !recipe.active);
      this.toast.success(recipe.active ? 'Receta archivada.' : 'Receta publicada.');
    } catch (error) {
      this.toast.error(messageFromError(error));
    }
  }

  protected async remove(recipe: Recipe): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Eliminar receta',
      message: `Se va a eliminar "${recipe.title}" y su imagen de forma permanente. Si preferís ocultarla, archivala.`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) {
      return;
    }
    try {
      await this.recipesService.remove(recipe);
      this.toast.success('Receta eliminada.');
    } catch (error) {
      this.toast.error(messageFromError(error));
    }
  }
}
