import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { RecipesService } from '@core/services/recipes.service';
import { Badge } from '@shared/components/badge/badge';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { Icon } from '@shared/components/icon/icon';
import { LoadingState } from '@shared/components/loading-state/loading-state';
import { PageHeader } from '@shared/components/page-header/page-header';
import {
  Recipe,
  RECIPE_CATEGORIES,
  RECIPE_CATEGORY_LABELS,
  RecipeCategory,
} from '@shared/models/recipe';

export function filterRecipes(
  recipes: readonly Recipe[],
  term: string,
  category: RecipeCategory | 'all',
): Recipe[] {
  const needle = term.trim().toLowerCase();
  return recipes.filter(
    (r) =>
      (category === 'all' || r.category === category) &&
      (needle === '' ||
        `${r.title} ${r.description} ${r.tags.join(' ')} ${r.ingredients.join(' ')}`
          .toLowerCase()
          .includes(needle)),
  );
}

@Component({
  selector: 'app-recipes-page',
  imports: [RouterLink, PageHeader, Badge, Icon, LoadingState, ErrorState, EmptyState],
  templateUrl: './recipes-page.html',
  styleUrl: './recipes-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipesPage {
  private readonly recipesService = inject(RecipesService);

  protected readonly categories = RECIPE_CATEGORIES;
  protected readonly categoryLabels = RECIPE_CATEGORY_LABELS;
  protected readonly search = signal('');
  protected readonly category = signal<RecipeCategory | 'all'>('all');

  protected readonly recipes = rxResource({ stream: () => this.recipesService.activeRecipes$() });

  protected readonly filtered = computed(() =>
    filterRecipes(
      this.recipes.hasValue() ? this.recipes.value() : [],
      this.search(),
      this.category(),
    ),
  );

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }
}
