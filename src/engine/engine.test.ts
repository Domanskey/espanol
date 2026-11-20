import { describe, expect, it } from 'vitest';
import { check, parseFill } from './check';
import { conjugate, VERBS } from '../data/verbs';

describe('check', () => {
  it('accepts exact answers, case and punctuation insensitive', () => {
    expect(check('Habló', ['habló'])).toBe('ok');
    expect(check('  habló. ', ['habló'])).toBe('ok');
  });
  it('flags missing accents separately', () => {
    expect(check('hablo', ['habló'])).toBe('accent');
    expect(check('estuve', ['tuve'])).toBe('wrong');
  });
  it('does not treat ñ as an accent', () => {
    expect(check('ano', ['año'])).toBe('wrong');
  });
  it('accepts alternatives and optional subject', () => {
    expect(check('estuve', ['fui', 'estuve'])).toBe('ok');
    expect(check('yo hablé', ['hablé'], { allowSubject: true })).toBe('ok');
  });
  it('parses blanks', () => {
    const segs = parseFill('Ayer [[fui/estuve|ir]] al cine.');
    expect(segs).toEqual(['Ayer ', { answers: ['fui', 'estuve'], hint: 'ir' }, ' al cine.']);
  });
});

describe('conjugate', () => {
  const cases: [string, Parameters<typeof conjugate>[1], number, string][] = [
    ['hablar', 'indefinido', 2, 'habló'],
    ['comer', 'indefinido', 0, 'comí'],
    ['tener', 'indefinido', 2, 'tuvo'],
    ['decir', 'indefinido', 5, 'dijeron'],
    ['hacer', 'indefinido', 2, 'hizo'],
    ['buscar', 'indefinido', 0, 'busqué'],
    ['llegar', 'indefinido', 0, 'llegué'],
    ['empezar', 'indefinido', 0, 'empecé'],
    ['pedir', 'indefinido', 2, 'pidió'],
    ['dormir', 'indefinido', 5, 'durmieron'],
    ['leer', 'indefinido', 2, 'leyó'],
    ['levantarse', 'indefinido', 0, 'me levanté'],
    ['ser', 'imperfecto', 3, 'éramos'],
    ['vivir', 'imperfecto', 4, 'vivíais'],
    ['hablar', 'imperfecto', 3, 'hablábamos'],
    ['escribir', 'perfecto', 1, 'has escrito'],
    ['volver', 'perfecto', 3, 'hemos vuelto'],
    ['leer', 'perfecto', 0, 'he leído'],
    ['querer', 'presente', 0, 'quiero'],
    ['recordar', 'presente', 3, 'recordamos'],
    ['seguir', 'presente', 1, 'sigues'],
    ['acostarse', 'presente', 2, 'se acuesta'],
    ['dormir', 'gerundio', 0, 'estoy durmiendo'],
    ['leer', 'gerundio', 2, 'está leyendo'],
  ];
  it.each(cases)('%s %s %i -> %s', (inf, tense, p, expected) => {
    expect(conjugate(inf, tense, p)).toBe(expected);
  });
  it('every verb conjugates in every tense', () => {
    for (const v of VERBS)
      for (const t of ['presente', 'indefinido', 'imperfecto', 'perfecto', 'gerundio'] as const)
        for (let p = 0; p < 6; p++) expect(conjugate(v.inf, t, p)).toMatch(/^[a-záéíóúñ ]+$/);
  });
});
