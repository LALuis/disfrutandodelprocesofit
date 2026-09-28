import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { RecipesService } from '@core/services/recipes.service';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { Icon } from '@shared/components/icon/icon';
import { LoadingState } from '@shared/components/loading-state/loading-state';
import { RECIPE_CATEGORY_LABELS } from '@shared/models/recipe';

@Component({
  selector: 'app-recipe-detail-page',
  imports: [RouterLink, Badge, Button, Icon, LoadingState, ErrorState, EmptyState],
  templateUrl: './recipe-detail-page.html',
  styleUrl: './recipe-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeDetailPage {
  private readonly recipesService = inject(RecipesService);

  /** Route param. */
  readonly id = input.required<string>();

  protected readonly categoryLabels = RECIPE_CATEGORY_LABELS;
  protected readonly recipe = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.recipesService.recipe$(params),
  });
}
