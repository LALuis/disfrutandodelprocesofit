import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AppIconName } from '../icon/app-icons';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-empty-state',
  imports: [Icon],
  template: `
    <div class="empty-state__icon">
      <app-icon [name]="icon()" [size]="28" />
    </div>
    <h2 class="empty-state__title">{{ title() }}</h2>
    @if (description()) {
      <p class="empty-state__description">{{ description() }}</p>
    }
    <div class="empty-state__actions"><ng-content /></div>
  `,
  styleUrl: './state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly icon = input<AppIconName>('inbox');
}
