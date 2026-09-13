import { DEFAULT_GYM_SETTINGS } from '@shared/models/gym-settings';
import { toGymSettings } from './gym-settings.service';

describe('toGymSettings', () => {
  it('returns the defaults when the document does not exist', () => {
    expect(toGymSettings(null)).toBe(DEFAULT_GYM_SETTINGS);
  });

  it('overrides defaults with non-empty string fields only', () => {
    const settings = toGymSettings({
      gymName: 'Mi gym',
      whatsapp: '+598 99 000 000',
      heroTitle: '   ',
      address: 123,
      unknownField: 'ignored',
    });
    expect(settings.gymName).toBe('Mi gym');
    expect(settings.whatsapp).toBe('+598 99 000 000');
    expect(settings.heroTitle).toBe(DEFAULT_GYM_SETTINGS.heroTitle);
    expect(settings.address).toBe('');
    expect('unknownField' in settings).toBe(false);
  });
});
