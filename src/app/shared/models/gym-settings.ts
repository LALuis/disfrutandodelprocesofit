import { GYM_BRAND } from '@shared/config/gym-brand';

/** Public gym configuration stored in `gymSettings/public`. Editable by admins. */
export interface GymSettings {
  readonly gymName: string;
  readonly phone: string;
  readonly whatsapp: string;
  readonly email: string;
  readonly instagram: string;
  readonly facebook: string;
  readonly tiktok: string;
  readonly address: string;
  readonly openingHours: string;
  readonly heroTitle: string;
  readonly heroSubtitle: string;
}

/**
 * Fallback used until the Firestore document exists (fresh project) or while it loads,
 * so the public site never renders empty branding.
 */
export const DEFAULT_GYM_SETTINGS: GymSettings = {
  gymName: GYM_BRAND.name,
  phone: '',
  whatsapp: '',
  email: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  address: '',
  openingHours: '',
  heroTitle: 'Entrená con método. Disfrutá el proceso.',
  heroSubtitle: 'Entrená con método, medí tu progreso y disfrutá el camino.',
};
