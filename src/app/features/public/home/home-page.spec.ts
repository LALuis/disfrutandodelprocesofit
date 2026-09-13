import { splitHeroTitle } from './home-page';

describe('splitHeroTitle', () => {
  it('splits after the first sentence so the rest can be accented', () => {
    expect(splitHeroTitle('Entrená con método. Disfrutá el proceso.')).toEqual({
      lead: 'Entrená con método.',
      accent: 'Disfrutá el proceso.',
    });
    expect(splitHeroTitle('¡Vamos! Hoy es el día')).toEqual({
      lead: '¡Vamos!',
      accent: 'Hoy es el día',
    });
  });

  it('keeps single-sentence titles whole', () => {
    expect(splitHeroTitle('  Solo una frase  ')).toEqual({ lead: 'Solo una frase', accent: '' });
    expect(splitHeroTitle('Una frase.')).toEqual({ lead: 'Una frase.', accent: '' });
  });
});
