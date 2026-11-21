import { describe, expect, it } from 'vitest';
import { attachPronoun, conjugate } from '../data/verbs';

/** Rows copied from the booklet answer key (Unidad 9A / 9B, pp. 116–119) */
const AFIRMATIVO: [string, string, string, string, string][] = [
  // verb, tú, usted, ustedes, vosotros
  ['cerrar', 'cierra', 'cierre', 'cierren', 'cerrad'],
  ['entender', 'entiende', 'entienda', 'entiendan', 'entended'],
  ['empezar', 'empieza', 'empiece', 'empiecen', 'empezad'],
  ['pensar', 'piensa', 'piense', 'piensen', 'pensad'],
  ['volver', 'vuelve', 'vuelva', 'vuelvan', 'volved'],
  ['recordar', 'recuerda', 'recuerde', 'recuerden', 'recordad'],
  ['encontrar', 'encuentra', 'encuentre', 'encuentren', 'encontrad'],
  ['dormir', 'duerme', 'duerma', 'duerman', 'dormid'],
  ['pedir', 'pide', 'pida', 'pidan', 'pedid'],
  ['seguir', 'sigue', 'siga', 'sigan', 'seguid'],
  ['servir', 'sirve', 'sirva', 'sirvan', 'servid'],
  ['elegir', 'elige', 'elija', 'elijan', 'elegid'],
  ['ducharse', 'dúchate', 'dúchese', 'dúchense', 'duchaos'],
  ['levantarse', 'levántate', 'levántese', 'levántense', 'levantaos'],
  ['despertarse', 'despiértate', 'despiértese', 'despiértense', 'despertaos'],
  ['acostarse', 'acuéstate', 'acuéstese', 'acuéstense', 'acostaos'],
  ['sentarse', 'siéntate', 'siéntese', 'siéntense', 'sentaos'],
  ['vestirse', 'vístete', 'vístase', 'vístanse', 'vestíos'],
  ['reírse', 'ríete', 'ríase', 'ríanse', 'reíos'],
  ['hacer', 'haz', 'haga', 'hagan', 'haced'],
  ['tener', 'ten', 'tenga', 'tengan', 'tened'],
  ['poner', 'pon', 'ponga', 'pongan', 'poned'],
  ['salir', 'sal', 'salga', 'salgan', 'salid'],
  ['ir', 've', 'vaya', 'vayan', 'id'],
  ['ser', 'sé', 'sea', 'sean', 'sed'],
  ['decir', 'di', 'diga', 'digan', 'decid'],
  ['venir', 'ven', 'venga', 'vengan', 'venid'],
  ['dar', 'da', 'dé', 'den', 'dad'],
  ['relajarse', 'relájate', 'relájese', 'relájense', 'relajaos'],
  ['concentrarse', 'concéntrate', 'concéntrese', 'concéntrense', 'concentraos'],
  ['irse', 'vete', 'váyase', 'váyanse', 'idos'],
  ['ponerse', 'ponte', 'póngase', 'pónganse', 'poneos'],
];

/** verb, tú, usted, nosotros, vosotros, ustedes */
const NEGATIVO: [string, string, string, string, string, string][] = [
  ['comprar', 'no compres', 'no compre', 'no compremos', 'no compréis', 'no compren'],
  ['comer', 'no comas', 'no coma', 'no comamos', 'no comáis', 'no coman'],
  ['ver', 'no veas', 'no vea', 'no veamos', 'no veáis', 'no vean'],
  ['leer', 'no leas', 'no lea', 'no leamos', 'no leáis', 'no lean'],
  ['querer', 'no quieras', 'no quiera', 'no queramos', 'no queráis', 'no quieran'],
  ['perder', 'no pierdas', 'no pierda', 'no perdamos', 'no perdáis', 'no pierdan'],
  ['empezar', 'no empieces', 'no empiece', 'no empecemos', 'no empecéis', 'no empiecen'],
  ['sentarse', 'no te sientes', 'no se siente', 'no nos sentemos', 'no os sentéis', 'no se sienten'],
  ['sentirse', 'no te sientas', 'no se sienta', 'no nos sintamos', 'no os sintáis', 'no se sientan'],
  ['volar', 'no vueles', 'no vuele', 'no volemos', 'no voléis', 'no vuelen'],
  ['dormir', 'no duermas', 'no duerma', 'no durmamos', 'no durmáis', 'no duerman'],
  ['jugar', 'no juegues', 'no juegue', 'no juguemos', 'no juguéis', 'no jueguen'],
  ['acostarse', 'no te acuestes', 'no se acueste', 'no nos acostemos', 'no os acostéis', 'no se acuesten'],
  ['pedir', 'no pidas', 'no pida', 'no pidamos', 'no pidáis', 'no pidan'],
  ['elegir', 'no elijas', 'no elija', 'no elijamos', 'no elijáis', 'no elijan'],
  ['vestirse', 'no te vistas', 'no se vista', 'no nos vistamos', 'no os vistáis', 'no se vistan'],
  ['reírse', 'no te rías', 'no se ría', 'no nos riamos', 'no os riáis', 'no se rían'],
  ['conducir', 'no conduzcas', 'no conduzca', 'no conduzcamos', 'no conduzcáis', 'no conduzcan'],
  ['dar', 'no des', 'no dé', 'no demos', 'no deis', 'no den'],
  ['coger', 'no cojas', 'no coja', 'no cojamos', 'no cojáis', 'no cojan'],
  ['traer', 'no traigas', 'no traiga', 'no traigamos', 'no traigáis', 'no traigan'],
  ['caerse', 'no te caigas', 'no se caiga', 'no nos caigamos', 'no os caigáis', 'no se caigan'],
  ['construir', 'no construyas', 'no construya', 'no construyamos', 'no construyáis', 'no construyan'],
  ['poner', 'no pongas', 'no ponga', 'no pongamos', 'no pongáis', 'no pongan'],
  ['decir', 'no digas', 'no diga', 'no digamos', 'no digáis', 'no digan'],
  ['hacer', 'no hagas', 'no haga', 'no hagamos', 'no hagáis', 'no hagan'],
  ['salir', 'no salgas', 'no salga', 'no salgamos', 'no salgáis', 'no salgan'],
  ['tener', 'no tengas', 'no tenga', 'no tengamos', 'no tengáis', 'no tengan'],
  ['ser', 'no seas', 'no sea', 'no seamos', 'no seáis', 'no sean'],
  ['ir', 'no vayas', 'no vaya', 'no vayamos', 'no vayáis', 'no vayan'],
  ['venir', 'no vengas', 'no venga', 'no vengamos', 'no vengáis', 'no vengan'],
  ['oír', 'no oigas', 'no oiga', 'no oigamos', 'no oigáis', 'no oigan'],
  ['irse', 'no te vayas', 'no se vaya', 'no nos vayamos', 'no os vayáis', 'no se vayan'],
];

describe('imperativo afirmativo (book 9A)', () => {
  it.each(AFIRMATIVO)('%s', (inf, tu, usted, ustedes, vos) => {
    expect([1, 2, 5, 4].map((p) => conjugate(inf, 'imperativo', p))).toEqual([tu, usted, ustedes, vos]);
    expect(conjugate(inf, 'imperativo', 0)).toBe('');
  });
});

describe('imperativo negativo (book 9B)', () => {
  it.each(NEGATIVO)('%s', (inf, ...forms) => {
    expect([1, 2, 3, 4, 5].map((p) => conjugate(inf, 'imperativo-neg', p))).toEqual(forms);
  });
});

describe('attachPronoun', () => {
  it.each([
    ['abre', 'la', 'ábrela'],
    ['coge', 'lo', 'cógelo'],
    ['deja', 'lo', 'déjalo'],
    ['haz', 'lo', 'hazlo'],
    ['di', 'me', 'dime'],
    ['abrid', 'lo', 'abridlo'],
    ['equivoca', 'te', 'equivócate'],
    ['queda', 'te', 'quédate'],
  ])('%s + %s = %s', (w, p, out) => expect(attachPronoun(w, p)).toBe(out));
});

describe('booklet indefinido tables (Unidad 2A)', () => {
  const rows: [string, string[]][] = [
    ['cruzar', ['crucé', 'cruzaste', 'cruzó', 'cruzamos', 'cruzasteis', 'cruzaron']],
    ['acordarse', ['me acordé', 'te acordaste', 'se acordó', 'nos acordamos', 'os acordasteis', 'se acordaron']],
    ['equivocarse', ['me equivoqué', 'te equivocaste', 'se equivocó', 'nos equivocamos', 'os equivocasteis', 'se equivocaron']],
    ['producir', ['produje', 'produjiste', 'produjo', 'produjimos', 'produjisteis', 'produjeron']],
    ['construir', ['construí', 'construiste', 'construyó', 'construimos', 'construisteis', 'construyeron']],
    ['mentir', ['mentí', 'mentiste', 'mintió', 'mentimos', 'mentisteis', 'mintieron']],
    ['corregir', ['corregí', 'corregiste', 'corrigió', 'corregimos', 'corregisteis', 'corrigieron']],
    ['caber', ['cupe', 'cupiste', 'cupo', 'cupimos', 'cupisteis', 'cupieron']],
    ['mantener', ['mantuve', 'mantuviste', 'mantuvo', 'mantuvimos', 'mantuvisteis', 'mantuvieron']],
  ];
  it.each(rows)('%s', (inf, forms) => {
    expect([0, 1, 2, 3, 4, 5].map((p) => conjugate(inf, 'indefinido', p))).toEqual(forms);
  });
  it('present irregulars from Unidad 14', () => {
    expect(conjugate('caber', 'presente', 0)).toBe('quepo');
    expect(conjugate('corregir', 'presente', 0)).toBe('corrijo');
    expect(conjugate('corregir', 'presente', 2)).toBe('corrige');
    expect(conjugate('enviar', 'presente', 0)).toBe('envío');
    expect(conjugate('acordarse', 'presente', 0)).toBe('me acuerdo');
    expect(conjugate('parecerse', 'presente', 0)).toBe('me parezco');
    expect(conjugate('volar', 'presente', 1)).toBe('vuelas');
  });
});
