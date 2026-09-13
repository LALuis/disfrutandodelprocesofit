import { AppIconName } from '@shared/components/icon/app-icons';

export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: AppIconName;
  /** Match the route exactly (used for index routes such as the dashboard). */
  readonly exact?: boolean;
}
