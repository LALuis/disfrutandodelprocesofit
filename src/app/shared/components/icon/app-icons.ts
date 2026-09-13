import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardList,
  Clock,
  Dumbbell,
  HeartPulse,
  House,
  IconNode,
  Inbox,
  LayoutDashboard,
  LineChart,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Music2,
  Phone,
  ShieldAlert,
  Sparkles,
  Target,
  Users,
  X,
} from 'lucide';

/**
 * Brand marks are not part of Lucide anymore; these nodes follow the same 24x24 stroke
 * style so they blend with the rest of the set.
 */
const Instagram: IconNode = [
  ['rect', { width: '20', height: '20', x: '2', y: '2', rx: '5', ry: '5' }],
  ['path', { d: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' }],
  ['line', { x1: '17.5', x2: '17.51', y1: '6.5', y2: '6.5' }],
];

const Facebook: IconNode = [
  ['path', { d: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' }],
];

/**
 * Curated icon registry. Importing icons individually keeps the bundle tree-shakeable:
 * add a new icon here when a feature needs it instead of importing the full library.
 */
export const APP_ICONS = {
  activity: Activity,
  'alert-triangle': AlertTriangle,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  calendar: CalendarDays,
  check: Check,
  clipboard: ClipboardList,
  clock: Clock,
  close: X,
  dashboard: LayoutDashboard,
  dumbbell: Dumbbell,
  facebook: Facebook,
  'heart-pulse': HeartPulse,
  home: House,
  inbox: Inbox,
  instagram: Instagram,
  'line-chart': LineChart,
  'log-in': LogIn,
  'log-out': LogOut,
  mail: Mail,
  'map-pin': MapPin,
  menu: Menu,
  phone: Phone,
  'shield-alert': ShieldAlert,
  sparkles: Sparkles,
  target: Target,
  tiktok: Music2,
  users: Users,
  whatsapp: MessageCircle,
} as const satisfies Record<string, IconNode>;

export type AppIconName = keyof typeof APP_ICONS;
