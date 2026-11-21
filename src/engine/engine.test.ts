import { describe, expect, it } from 'vitest';
import { check, parseFill } from './check';
import { acceptedForms, conjugate, personsFor, VERBS } from '../data/verbs';

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
    ['oler', 'presente', 0, 'huelo'],
    ['actuar', 'presente', 0, 'actúo'],
    ['sonreír', 'presente', 0, 'sonrío'],
    ['sonreír', 'indefinido', 2, 'sonrió'],
    ['medir', 'presente', 0, 'mido'],
    ['perseguir', 'presente', 0, 'persigo'],
    ['perseguir', 'indefinido', 5, 'persiguieron'],
    ['alojarse', 'indefinido', 0, 'me alojé'],
    ['especializarse', 'indefinido', 0, 'me especialicé'],
    ['graduarse', 'presente', 0, 'me gradúo'],
    ['graduarse', 'indefinido', 2, 'se graduó'],
    ['morirse', 'gerundio', 0, 'me estoy muriendo'],
    ['aprobar', 'presente', 2, 'aprueba'],
    ['merendar', 'presente', 5, 'meriendan'],
    ['sonreír', 'gerundio', 0, 'estoy sonriendo'],
    ['reírse', 'gerundio', 0, 'me estoy riendo'],
  ];
  it.each(cases)('%s %s %i -> %s', (inf, tense, p, expected) => {
    expect(conjugate(inf, tense, p)).toBe(expected);
  });
  it('every verb conjugates in every tense', () => {
    for (const v of VERBS)
      for (const t of ['presente', 'indefinido', 'imperfecto', 'perfecto', 'gerundio', 'imperativo', 'imperativo-neg'] as const)
        for (const p of personsFor(t)) expect(conjugate(v.inf, t, p), `${v.inf} ${t} ${p}`).toMatch(/^[a-záéíóúñ ]+$/);
  });

  it('reflexive gerunds accept the attached pronoun', () => {
    expect(acceptedForms('ducharse', 'gerundio', 0)).toEqual(['me estoy duchando', 'estoy duchándome']);
    expect(acceptedForms('reírse', 'gerundio', 2)).toEqual(['se está riendo', 'está riéndose']);
    expect(acceptedForms('hablar', 'gerundio', 0)).toEqual(['estoy hablando']);
  });
});
