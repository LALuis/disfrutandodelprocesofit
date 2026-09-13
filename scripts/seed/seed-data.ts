/**
 * Development-only demo data. Extended in later milestones (slots, bookings, measurements,
 * training/nutrition plans, recipes).
 *
 * LOCAL-ONLY CREDENTIALS: the password below is used exclusively against the Auth emulator.
 * Override it with SEED_PASSWORD if you prefer. Never reuse it anywhere real.
 */
export const DEMO_PASSWORD = process.env['SEED_PASSWORD'] ?? 'demo1234';

export type SeedRole = 'ADMIN' | 'STUDENT';

export interface SeedUser {
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: SeedRole;
  readonly phone?: string;
  readonly features: {
    readonly nutritionEnabled: boolean;
    readonly recipesEnabled: boolean;
  };
}

export const SEED_USERS: readonly SeedUser[] = [
  {
    email: 'admin@gym.local',
    firstName: 'Admin',
    lastName: 'Gym',
    role: 'ADMIN',
    features: { nutritionEnabled: true, recipesEnabled: true },
  },
  {
    email: 'student1@gym.local',
    firstName: 'Valentina',
    lastName: 'Pérez',
    role: 'STUDENT',
    phone: '+598 99 000 001',
    features: { nutritionEnabled: true, recipesEnabled: true },
  },
  {
    email: 'student2@gym.local',
    firstName: 'Martín',
    lastName: 'Rodríguez',
    role: 'STUDENT',
    phone: '+598 99 000 002',
    features: { nutritionEnabled: false, recipesEnabled: false },
  },
];

export const SEED_GYM_SETTINGS = {
  gymName: 'Disfrutando del proceso fit',
  phone: '+598 99 000 000',
  whatsapp: '+598 99 000 000',
  email: 'hola@disfrutandodelproceso.fit',
  instagram: 'https://instagram.com/disfrutandodelprocesofit',
  facebook: 'https://facebook.com/disfrutandodelprocesofit',
  tiktok: '',
  address: 'Dirección del gimnasio (placeholder), Montevideo',
  openingHours: 'Lunes a viernes 07:00–21:00 · Sábados 09:00–13:00',
  heroTitle: 'Entrená con método. Disfrutá el proceso.',
  heroSubtitle: 'Entrená con método, medí tu progreso y disfrutá el camino.',
};

export interface SeedMembershipPlan {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly currency: string;
  readonly frequency: 'monthly' | 'quarterly' | 'yearly';
  readonly features: readonly string[];
  readonly highlighted: boolean;
  readonly active: boolean;
  readonly displayOrder: number;
}

export const SEED_MEMBERSHIP_PLANS: readonly SeedMembershipPlan[] = [
  {
    id: 'plan-2-dias',
    name: '2 días por semana',
    description: 'Ideal para arrancar con una rutina sostenible.',
    price: 1900,
    currency: 'UYU',
    frequency: 'monthly',
    features: ['2 sesiones semanales', 'Ficha de entrenamiento', 'Seguimiento de progreso'],
    highlighted: false,
    active: true,
    displayOrder: 1,
  },
  {
    id: 'plan-3-dias',
    name: '3 días por semana',
    description: 'El equilibrio perfecto entre resultados y tiempo.',
    price: 2500,
    currency: 'UYU',
    frequency: 'monthly',
    features: [
      '3 sesiones semanales',
      'Ficha de entrenamiento personalizada',
      'Seguimiento de progreso',
      'Plan de nutrición',
    ],
    highlighted: true,
    active: true,
    displayOrder: 2,
  },
  {
    id: 'plan-libre',
    name: 'Pase libre',
    description: 'Entrená todos los días que quieras.',
    price: 3200,
    currency: 'UYU',
    frequency: 'monthly',
    features: [
      'Sesiones ilimitadas',
      'Ficha de entrenamiento personalizada',
      'Seguimiento de progreso',
      'Plan de nutrición',
      'Recetario',
    ],
    highlighted: false,
    active: true,
    displayOrder: 3,
  },
  {
    id: 'plan-archivado',
    name: 'Plan antiguo',
    description: 'Plan inactivo usado para probar el filtro de planes activos.',
    price: 1500,
    currency: 'UYU',
    frequency: 'monthly',
    features: ['Solo para pruebas'],
    highlighted: false,
    active: false,
    displayOrder: 99,
  },
];
