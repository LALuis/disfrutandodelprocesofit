import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Dumbbell,
  House,
  IconNode,
  Inbox,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  ShieldAlert,
  X,
} from 'lucide';

/**
 * Curated icon registry. Importing icons individually keeps the bundle tree-shakeable:
 * add a new icon here when a feature needs it instead of importing the full library.
 */
export const APP_ICONS = {
  'alert-triangle': AlertTriangle,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  calendar: CalendarDays,
  dumbbell: Dumbbell,
  home: House,
  inbox: Inbox,
  dashboard: LayoutDashboard,
  'log-in': LogIn,
  'log-out': LogOut,
  menu: Menu,
  'shield-alert': ShieldAlert,
  close: X,
} as const satisfies Record<string, IconNode>;

export type AppIconName = keyof typeof APP_ICONS;
