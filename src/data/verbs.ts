import type { Tense } from '../types';

export const PERSONS = ['yo', 'tú', 'él / ella / usted', 'nosotros/as', 'vosotros/as', 'ellos/as / ustedes'];
export const PERSONS_SHORT = ['yo', 'tú', 'él', 'nosotros', 'vosotros', 'ellos'];
const REFLEXIVE = ['me', 'te', 'se', 'nos', 'os', 'se'];
const HABER = ['he', 'has', 'ha', 'hemos', 'habéis', 'han'];

export const TENSE_LABEL: Record<Tense, string> = {
  presente: 'Presente',
  indefinido: 'Pret. indefinido (perfecto simple)',
  imperfecto: 'Pret. imperfecto',
  perfecto: 'Pret. perfecto (compuesto)',
  gerundio: 'Estar + gerundio',
};

type Six = [string, string, string, string, string, string];

export interface Verb {
  inf: string;
  en: string;
  /** present: stem change, yo form, or the full table */
  pres?: { change?: 'ie' | 'ue' | 'i'; yo?: string; full?: Six };
  /** indefinido: strong stem (tuv-, estuv-…), -ir stem change in 3rd persons, or full table */
  pret?: { strong?: string; change?: 'i' | 'u'; full?: Six };
  imp?: Six;
  part?: string;
  ger?: string;
  /** only used in the 3rd person (llover): excluded from person drills */
  impersonal?: true;
}

export const VERBS: Verb[] = [
  // ---- -AR regulares
  { inf: 'hablar', en: 'to speak' },
  { inf: 'trabajar', en: 'to work' },
  { inf: 'estudiar', en: 'to study' },
  { inf: 'visitar', en: 'to visit' },
  { inf: 'viajar', en: 'to travel' },
  { inf: 'comprar', en: 'to buy' },
  { inf: 'tomar', en: 'to take / to drink' },
  { inf: 'cenar', en: 'to have dinner' },
  { inf: 'desayunar', en: 'to have breakfast' },
  { inf: 'bailar', en: 'to dance' },
  { inf: 'escuchar', en: 'to listen' },
  { inf: 'mirar', en: 'to look at' },
  { inf: 'pasear', en: 'to go for a walk' },
  { inf: 'nadar', en: 'to swim' },
  { inf: 'cantar', en: 'to sing' },
  { inf: 'llevar', en: 'to carry / to wear' },
  { inf: 'quedar', en: 'to meet up' },
  { inf: 'terminar', en: 'to finish' },
  { inf: 'explicar', en: 'to explain' },
  { inf: 'cocinar', en: 'to cook' },
  { inf: 'probar', en: 'to try / to taste', pres: { change: 'ue' } },
  { inf: 'llegar', en: 'to arrive' },
  { inf: 'pagar', en: 'to pay' },
  { inf: 'buscar', en: 'to look for' },
  { inf: 'tocar', en: 'to touch / to play (instrument)' },
  { inf: 'practicar', en: 'to practise' },
  { inf: 'sacar', en: 'to take out' },
  { inf: 'empezar', en: 'to begin', pres: { change: 'ie' } },
  { inf: 'comenzar', en: 'to begin', pres: { change: 'ie' } },
  { inf: 'cerrar', en: 'to close', pres: { change: 'ie' } },
  { inf: 'pensar', en: 'to think', pres: { change: 'ie' } },
  { inf: 'recordar', en: 'to remember', pres: { change: 'ue' } },
  { inf: 'encontrar', en: 'to find', pres: { change: 'ue' } },
  { inf: 'contar', en: 'to count / to tell', pres: { change: 'ue' } },
  { inf: 'jugar', en: 'to play', pres: { full: ['juego', 'juegas', 'juega', 'jugamos', 'jugáis', 'juegan'] } },
  { inf: 'andar', en: 'to walk', pret: { strong: 'anduv' } },
  {
    inf: 'estar',
    en: 'to be (state / place)',
    pres: { full: ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'] },
    pret: { strong: 'estuv' },
  },
  {
    inf: 'dar',
    en: 'to give',
    pres: { full: ['doy', 'das', 'da', 'damos', 'dais', 'dan'] },
    pret: { full: ['di', 'diste', 'dio', 'dimos', 'disteis', 'dieron'] },
  },
  // ---- reflexivos -AR
  { inf: 'levantarse', en: 'to get up' },
  { inf: 'ducharse', en: 'to have a shower' },
  { inf: 'lavarse', en: 'to wash (oneself)' },
  { inf: 'llamarse', en: 'to be called' },
  { inf: 'quedarse', en: 'to stay' },
  { inf: 'acostarse', en: 'to go to bed', pres: { change: 'ue' } },
  { inf: 'sentarse', en: 'to sit down', pres: { change: 'ie' } },
  { inf: 'despertarse', en: 'to wake up', pres: { change: 'ie' } },

  // ---- -ER
  { inf: 'comer', en: 'to eat' },
  { inf: 'beber', en: 'to drink' },
  { inf: 'aprender', en: 'to learn' },
  { inf: 'correr', en: 'to run' },
  { inf: 'vender', en: 'to sell' },
  { inf: 'comprender', en: 'to understand' },
  { inf: 'entender', en: 'to understand', pres: { change: 'ie' } },
  { inf: 'perder', en: 'to lose', pres: { change: 'ie' } },
  { inf: 'querer', en: 'to want / to love', pres: { change: 'ie' }, pret: { strong: 'quis' } },
  { inf: 'volver', en: 'to come back', pres: { change: 'ue' }, part: 'vuelto' },
  { inf: 'mover', en: 'to move', pres: { change: 'ue' } },
  {
    inf: 'poder',
    en: 'can / to be able to',
    pres: { change: 'ue' },
    pret: { strong: 'pud' },
    ger: 'pudiendo',
  },
  { inf: 'conocer', en: 'to know (people, places)', pres: { yo: 'conozco' } },
  { inf: 'nacer', en: 'to be born', pres: { yo: 'nazco' } },
  { inf: 'parecer', en: 'to seem', pres: { yo: 'parezco' } },
  { inf: 'ofrecer', en: 'to offer', pres: { yo: 'ofrezco' } },
  { inf: 'coger', en: 'to take / to catch', pres: { yo: 'cojo' } },
  { inf: 'recoger', en: 'to pick up', pres: { yo: 'recojo' } },
  {
    inf: 'leer',
    en: 'to read',
    pret: { full: ['leí', 'leíste', 'leyó', 'leímos', 'leísteis', 'leyeron'] },
    part: 'leído',
    ger: 'leyendo',
  },
  {
    inf: 'creer',
    en: 'to believe',
    pret: { full: ['creí', 'creíste', 'creyó', 'creímos', 'creísteis', 'creyeron'] },
    part: 'creído',
    ger: 'creyendo',
  },
  {
    inf: 'ver',
    en: 'to see / to watch',
    pres: { full: ['veo', 'ves', 've', 'vemos', 'veis', 'ven'] },
    pret: { full: ['vi', 'viste', 'vio', 'vimos', 'visteis', 'vieron'] },
    imp: ['veía', 'veías', 'veía', 'veíamos', 'veíais', 'veían'],
    part: 'visto',
  },
  {
    inf: 'ser',
    en: 'to be (identity)',
    pres: { full: ['soy', 'eres', 'es', 'somos', 'sois', 'son'] },
    pret: { full: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'] },
    imp: ['era', 'eras', 'era', 'éramos', 'erais', 'eran'],
  },
  {
    inf: 'tener',
    en: 'to have',
    pres: { full: ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'] },
    pret: { strong: 'tuv' },
  },
  {
    inf: 'hacer',
    en: 'to do / to make',
    pres: { yo: 'hago' },
    pret: { full: ['hice', 'hiciste', 'hizo', 'hicimos', 'hicisteis', 'hicieron'] },
    part: 'hecho',
  },
  { inf: 'poner', en: 'to put', pres: { yo: 'pongo' }, pret: { strong: 'pus' }, part: 'puesto' },
  {
    inf: 'saber',
    en: 'to know (facts)',
    pres: { yo: 'sé' },
    pret: { strong: 'sup' },
  },
  {
    inf: 'traer',
    en: 'to bring',
    pres: { yo: 'traigo' },
    pret: { strong: 'traj' },
    part: 'traído',
    ger: 'trayendo',
  },
  {
    inf: 'caerse',
    en: 'to fall down',
    pres: { yo: 'caigo' },
    pret: { full: ['caí', 'caíste', 'cayó', 'caímos', 'caísteis', 'cayeron'] },
    part: 'caído',
    ger: 'cayendo',
  },
  { inf: 'romper', en: 'to break', part: 'roto' },
  {
    inf: 'ponerse',
    en: 'to put on (clothes)',
    pres: { yo: 'pongo' },
    pret: { strong: 'pus' },
    part: 'puesto',
  },

  // ---- -IR
  { inf: 'escribir', en: 'to write', part: 'escrito' },
  { inf: 'vivir', en: 'to live' },
  { inf: 'abrir', en: 'to open', part: 'abierto' },
  { inf: 'subir', en: 'to go up / to climb' },
  { inf: 'recibir', en: 'to receive' },
  { inf: 'decidir', en: 'to decide' },
  { inf: 'compartir', en: 'to share' },
  { inf: 'descubrir', en: 'to discover', part: 'descubierto' },
  { inf: 'salir', en: 'to go out / to leave', pres: { yo: 'salgo' } },
  {
    inf: 'ir',
    en: 'to go',
    pres: { full: ['voy', 'vas', 'va', 'vamos', 'vais', 'van'] },
    pret: { full: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'] },
    imp: ['iba', 'ibas', 'iba', 'íbamos', 'ibais', 'iban'],
    ger: 'yendo',
  },
  {
    inf: 'irse',
    en: 'to leave / to go away',
    pres: { full: ['voy', 'vas', 'va', 'vamos', 'vais', 'van'] },
    pret: { full: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'] },
    imp: ['iba', 'ibas', 'iba', 'íbamos', 'ibais', 'iban'],
    ger: 'yendo',
  },
  {
    inf: 'venir',
    en: 'to come',
    pres: { full: ['vengo', 'vienes', 'viene', 'venimos', 'venís', 'vienen'] },
    pret: { strong: 'vin' },
    ger: 'viniendo',
  },
  {
    inf: 'decir',
    en: 'to say / to tell',
    pres: { full: ['digo', 'dices', 'dice', 'decimos', 'decís', 'dicen'] },
    pret: { strong: 'dij' },
    part: 'dicho',
    ger: 'diciendo',
  },
  { inf: 'conducir', en: 'to drive', pres: { yo: 'conduzco' }, pret: { strong: 'conduj' } },
  { inf: 'traducir', en: 'to translate', pres: { yo: 'traduzco' }, pret: { strong: 'traduj' } },
  { inf: 'pedir', en: 'to ask for / to order', pres: { change: 'i' }, pret: { change: 'i' } },
  { inf: 'servir', en: 'to serve', pres: { change: 'i' }, pret: { change: 'i' } },
  { inf: 'repetir', en: 'to repeat', pres: { change: 'i' }, pret: { change: 'i' } },
  { inf: 'seguir', en: 'to follow / to continue', pres: { change: 'i', yo: 'sigo' }, pret: { change: 'i' } },
  { inf: 'elegir', en: 'to choose', pres: { change: 'i', yo: 'elijo' }, pret: { change: 'i' } },
  { inf: 'vestirse', en: 'to get dressed', pres: { change: 'i' }, pret: { change: 'i' } },
  { inf: 'preferir', en: 'to prefer', pres: { change: 'ie' }, pret: { change: 'i' } },
  { inf: 'divertirse', en: 'to have fun', pres: { change: 'ie' }, pret: { change: 'i' } },
  { inf: 'sentirse', en: 'to feel', pres: { change: 'ie' }, pret: { change: 'i' } },
  { inf: 'dormir', en: 'to sleep', pres: { change: 'ue' }, pret: { change: 'u' } },
  { inf: 'morir', en: 'to die', pres: { change: 'ue' }, pret: { change: 'u' }, part: 'muerto' },
  {
    inf: 'oír',
    en: 'to hear',
    pres: { full: ['oigo', 'oyes', 'oye', 'oímos', 'oís', 'oyen'] },
    pret: { full: ['oí', 'oíste', 'oyó', 'oímos', 'oísteis', 'oyeron'] },
    imp: ['oía', 'oías', 'oía', 'oíamos', 'oíais', 'oían'],
    part: 'oído',
    ger: 'oyendo',
  },
  {
    inf: 'reírse',
    en: 'to laugh',
    pres: { full: ['río', 'ríes', 'ríe', 'reímos', 'reís', 'ríen'] },
    pret: { full: ['reí', 'reíste', 'rio', 'reímos', 'reísteis', 'rieron'] },
    imp: ['reía', 'reías', 'reía', 'reíamos', 'reíais', 'reían'],
    part: 'reído',
    ger: 'riendo',
  },

  // ---- added from the answer key (Unidades 0–6)
  { inf: 'llamar', en: 'to call' },
  // gustar-type verbs: practised as me/te/le/nos/os/les gusta(n) in the "gustar" topic, not as yo/tú drills
  { inf: 'gustar', en: 'to like (me gusta)', impersonal: true },
  { inf: 'encantar', en: 'to love (me encanta)', impersonal: true },
  { inf: 'doler', en: 'to hurt (me duele)', pres: { change: 'ue' }, impersonal: true },
  { inf: 'molestar', en: 'to bother (me molesta)', impersonal: true },
  { inf: 'interesar', en: 'to interest (me interesa)', impersonal: true },
  { inf: 'alojarse', en: 'to stay (lodging)' },
  { inf: 'gastar', en: 'to spend (money)' },
  { inf: 'graduarse', en: 'to graduate', pres: { full: ['gradúo', 'gradúas', 'gradúa', 'graduamos', 'graduáis', 'gradúan'] } },
  { inf: 'mudarse', en: 'to move (house)' },
  { inf: 'aprobar', en: 'to pass (an exam)', pres: { change: 'ue' } },
  { inf: 'regalar', en: 'to give (as a present)' },
  { inf: 'preparar', en: 'to prepare' },
  { inf: 'entrenar', en: 'to train' },
  { inf: 'merendar', en: 'to have an afternoon snack', pres: { change: 'ie' } },
  { inf: 'descansar', en: 'to rest' },
  { inf: 'relajarse', en: 'to relax' },
  { inf: 'saludar', en: 'to greet' },
  { inf: 'cambiarse', en: 'to get changed' },
  { inf: 'especializarse', en: 'to specialise' },
  { inf: 'seleccionar', en: 'to select' },
  { inf: 'apoyar', en: 'to support' },
  { inf: 'aconsejar', en: 'to advise' },
  { inf: 'disfrutar', en: 'to enjoy' },
  { inf: 'cursar', en: 'to study (a course)' },
  { inf: 'besar', en: 'to kiss' },
  { inf: 'bañarse', en: 'to bathe / to swim' },
  { inf: 'caminar', en: 'to walk' },
  { inf: 'pasar', en: 'to pass / to spend (time) / to happen' },
  { inf: 'matricularse', en: 'to enrol' },
  { inf: 'centrarse', en: 'to focus' },
  { inf: 'casarse', en: 'to get married' },
  { inf: 'ganar', en: 'to win / to earn' },
  { inf: 'enseñar', en: 'to teach / to show' },
  { inf: 'destacar', en: 'to stand out' },
  { inf: 'sonar', en: 'to ring / to sound', pres: { change: 'ue' } },
  { inf: 'llover', en: 'to rain', pres: { change: 'ue' }, impersonal: true },
  { inf: 'defender', en: 'to defend', pres: { change: 'ie' } },
  { inf: 'confundir', en: 'to confuse' },
  { inf: 'perseguir', en: 'to chase / to persecute', pres: { change: 'i', yo: 'persigo' }, pret: { change: 'i' } },
  { inf: 'medir', en: 'to measure / to be (height)', pres: { change: 'i' }, pret: { change: 'i' } },
  { inf: 'morirse', en: 'to die (also: me muero de calor)', pres: { change: 'ue' }, pret: { change: 'u' }, part: 'muerto' },
  {
    inf: 'prohibir',
    en: 'to forbid',
    pres: { full: ['prohíbo', 'prohíbes', 'prohíbe', 'prohibimos', 'prohibís', 'prohíben'] },
  },
  {
    inf: 'oler',
    en: 'to smell',
    pres: { full: ['huelo', 'hueles', 'huele', 'olemos', 'oléis', 'huelen'] },
  },
  {
    inf: 'actuar',
    en: 'to act',
    pres: { full: ['actúo', 'actúas', 'actúa', 'actuamos', 'actuáis', 'actúan'] },
  },
  {
    inf: 'sonreír',
    en: 'to smile',
    pres: { full: ['sonrío', 'sonríes', 'sonríe', 'sonreímos', 'sonreís', 'sonríen'] },
    pret: { full: ['sonreí', 'sonreíste', 'sonrió', 'sonreímos', 'sonreísteis', 'sonrieron'] },
    part: 'sonreído',
    ger: 'sonriendo',
  },
];

const BY_INF = new Map(VERBS.map((v) => [v.inf, v]));
export const hasVerb = (inf: string) => BY_INF.has(inf);

/** Verbs that can be drilled in all persons */
export const DRILL_VERBS = VERBS.filter((v) => !v.impersonal).map((v) => v.inf);

export function getVerb(inf: string): Verb {
  const v = BY_INF.get(inf);
  if (!v) throw new Error(`Unknown verb: ${inf}`);
  return v;
}

const isReflexive = (v: Verb) => v.inf.endsWith('se');
const baseInf = (v: Verb) => (isReflexive(v) ? v.inf.slice(0, -2) : v.inf);
const group = (v: Verb): 'ar' | 'er' | 'ir' => {
  const end = baseInf(v).slice(-2).replace('í', 'i');
  return end as 'ar' | 'er' | 'ir';
};
const stem = (v: Verb) => baseInf(v).slice(0, -2);

/** Replace the last vowel `from` in the stem: quer -> quier, dorm -> duerm */
function changeStem(s: string, kind: 'ie' | 'ue' | 'i' | 'u'): string {
  const from = kind === 'ue' || kind === 'u' ? 'o' : 'e';
  const i = s.lastIndexOf(from);
  if (i < 0) return s;
  return s.slice(0, i) + kind + s.slice(i + 1);
}

const END = {
  presente: {
    ar: ['o', 'as', 'a', 'amos', 'áis', 'an'],
    er: ['o', 'es', 'e', 'emos', 'éis', 'en'],
    ir: ['o', 'es', 'e', 'imos', 'ís', 'en'],
  },
  indefinido: {
    ar: ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'],
    er: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
    ir: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
  },
  imperfecto: {
    ar: ['aba', 'abas', 'aba', 'ábamos', 'abais', 'aban'],
    er: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
    ir: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
  },
};

function presente(v: Verb, p: number): string {
  if (v.pres?.full) return v.pres.full[p];
  if (p === 0 && v.pres?.yo) return v.pres.yo;
  let s = stem(v);
  if (v.pres?.change && [0, 1, 2, 5].includes(p)) s = changeStem(s, v.pres.change);
  return s + END.presente[group(v)][p];
}

function indefinido(v: Verb, p: number): string {
  if (v.pret?.full) return v.pret.full[p];
  if (v.pret?.strong) {
    const st = v.pret.strong;
    const ends = ['e', 'iste', 'o', 'imos', 'isteis', st.endsWith('j') ? 'eron' : 'ieron'];
    return st + ends[p];
  }
  let s = stem(v);
  if (p === 0 && group(v) === 'ar') {
    if (s.endsWith('c')) return s.slice(0, -1) + 'qué';
    if (s.endsWith('g')) return s + 'ué';
    if (s.endsWith('z')) return s.slice(0, -1) + 'cé';
  }
  if (v.pret?.change && (p === 2 || p === 5)) s = changeStem(s, v.pret.change);
  return s + END.indefinido[group(v)][p];
}

function imperfecto(v: Verb, p: number): string {
  if (v.imp) return v.imp[p];
  return stem(v) + END.imperfecto[group(v)][p];
}

export function participle(v: Verb): string {
  if (v.part) return v.part;
  return stem(v) + (group(v) === 'ar' ? 'ado' : 'ido');
}

export function gerund(v: Verb): string {
  if (v.ger) return v.ger;
  let s = stem(v);
  if (v.pret?.change) s = changeStem(s, v.pret.change);
  return s + (group(v) === 'ar' ? 'ando' : 'iendo');
}

const ESTAR = ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'];

export function conjugate(inf: string, tense: Tense, p: number): string {
  const v = getVerb(inf);
  const refl = isReflexive(v) ? REFLEXIVE[p] + ' ' : '';
  switch (tense) {
    case 'presente':
      return refl + presente(v, p);
    case 'indefinido':
      return refl + indefinido(v, p);
    case 'imperfecto':
      return refl + imperfecto(v, p);
    case 'perfecto':
      return refl + HABER[p] + ' ' + participle(v);
    case 'gerundio':
      return refl + ESTAR[p] + ' ' + gerund(v);
  }
}

/** Verbs with something irregular in a given tense (used to pick drill pools) */
export function isIrregular(inf: string, tense: Tense): boolean {
  const v = getVerb(inf);
  switch (tense) {
    case 'presente':
      return !!v.pres;
    case 'indefinido':
      return !!v.pret || /(car|gar|zar)(se)?$/.test(v.inf);
    case 'imperfecto':
      return !!v.imp;
    case 'perfecto':
      return !!v.part;
    case 'gerundio':
      return !!v.ger || !!v.pret?.change;
  }
}

/** All accepted answers for a form: reflexive gerunds also allow the attached pronoun (estoy duchándome) */
export function acceptedForms(inf: string, tense: Tense, p: number): string[] {
  const main = conjugate(inf, tense, p);
  if (tense !== 'gerundio' || !isReflexive(getVerb(inf))) return [main];
  const [pron, estar, ger] = main.split(' ');
  const accented = ger.replace(/([ae])ndo$/, (_, v: string) => (v === 'a' ? 'á' : 'é') + 'ndo');
  return [main, `${estar} ${accented}${pron}`];
}
