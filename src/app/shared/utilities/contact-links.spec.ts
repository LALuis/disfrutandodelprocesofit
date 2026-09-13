import { mailtoUrl, telUrl, whatsappUrl } from './contact-links';

describe('whatsappUrl', () => {
  it('strips formatting and encodes the message', () => {
    expect(whatsappUrl('+598 99 000 000', 'Hola! ¿Planes?')).toBe(
      'https://wa.me/59899000000?text=Hola!%20%C2%BFPlanes%3F',
    );
  });

  it('omits the text param when there is no message', () => {
    expect(whatsappUrl('099000000')).toBe('https://wa.me/099000000');
    expect(whatsappUrl('099000000', '   ')).toBe('https://wa.me/099000000');
  });

  it('returns an empty string when no digits are present', () => {
    expect(whatsappUrl('')).toBe('');
    expect(whatsappUrl('no number')).toBe('');
  });
});

describe('telUrl / mailtoUrl', () => {
  it('build links only when there is a value', () => {
    expect(telUrl('+598 (99) 000-000')).toBe('tel:+59899000000');
    expect(telUrl('')).toBe('');
    expect(mailtoUrl(' hola@gym.uy ')).toBe('mailto:hola@gym.uy');
    expect(mailtoUrl('')).toBe('');
  });
});
