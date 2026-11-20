import type { Exercise, Tense, Topic, Verdict } from '../types';
import { TOPICS } from '../data/topics';
import { conjugate, getVerb, isIrregular, VERBS } from '../data/verbs';
import { blanksOf, check } from './check';
import { allStats, isDue, itemScore } from './progress';

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export function conjVerbs(topic: Topic): string[] {
  if (!topic.conj) return [];
  if (topic.conj.verbs) return topic.conj.verbs;
  const t = topic.conj.tense;
  // presente & gerundio: regulars are A1, drill only the irregular ones
  if (t === 'presente' || t === 'gerundio') return VERBS.filter((v) => isIrregular(v.inf, t)).map((v) => v.inf);
  return VERBS.map((v) => v.inf);
}

export function conjExercise(topicId: string, inf: string, tense: Tense, person: number): Exercise {
  return {
    kind: 'conjugate',
    id: `c:${tense}:${inf}:${person}`,
    topic: topicId,
    verb: inf,
    en: getVerb(inf).en,
    tense,
    person,
    answer: conjugate(inf, tense, person),
  };
}

const conjCache = new Map<string, Exercise[]>();
export function conjExercises(topic: Topic): Exercise[] {
  if (!topic.conj) return [];
  let list = conjCache.get(topic.id);
  if (!list) {
    list = conjVerbs(topic).flatMap((inf) =>
      [0, 1, 2, 3, 4, 5].map((p) => conjExercise(topic.id, inf, topic.conj!.tense, p)),
    );
    conjCache.set(topic.id, list);
  }
  return list;
}

const itemCache = new Map<string, Exercise[]>();
export function itemExercises(topic: Topic): Exercise[] {
  let list = itemCache.get(topic.id);
  if (!list) {
    list = topic.items.map((it): Exercise => {
      const id = `${topic.id}:${hash(it.text)}`;
      return it.t === 'fill'
        ? { kind: 'fill', id, topic: topic.id, text: it.text, why: it.why, title: it.title }
        : { kind: 'choice', id, topic: topic.id, text: it.text, options: it.options, answer: it.answer, why: it.why };
    });
    itemCache.set(topic.id, list);
  }
  return list;
}

export function topicById(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}

/** Order: recently failed & due → never seen → due → the rest (oldest first) */
function prioritize(list: Exercise[]): Exercise[] {
  const stats = allStats();
  const failed: Exercise[] = [];
  const unseen: Exercise[] = [];
  const due: Exercise[] = [];
  const rest: Exercise[] = [];
  for (const e of list) {
    const st = stats[e.id];
    if (!st) unseen.push(e);
    else if (st.box <= 2 && isDue(e.id)) failed.push(e);
    else if (isDue(e.id)) due.push(e);
    else rest.push(e);
  }
  rest.sort((a, b) => stats[a.id].last - stats[b.id].last);
  return [...shuffle(failed), ...shuffle(unseen), ...shuffle(due), ...rest];
}

export function buildPractice(topic: Topic, n = 15): Exercise[] {
  const conj = conjExercises(topic);
  const items = itemExercises(topic);
  let nConj = 0;
  if (conj.length && items.length) nConj = Math.round(n * 0.4);
  else if (conj.length) nConj = n;
  const picked = [...prioritize(conj).slice(0, nConj), ...prioritize(items).slice(0, n - nConj)];
  return shuffle(picked);
}

/** Every exercise, keyed by id (for review mode) */
let allMap: Map<string, Exercise> | null = null;
function allExercises(): Map<string, Exercise> {
  if (!allMap) {
    allMap = new Map();
    for (const t of TOPICS) for (const e of [...conjExercises(t), ...itemExercises(t)]) allMap.set(e.id, e);
  }
  return allMap;
}

export function mistakes(): Exercise[] {
  const stats = allStats();
  const all = allExercises();
  return Object.entries(stats)
    .filter(([id, st]) => st.box <= 2 && all.has(id))
    .sort((a, b) => b[1].last - a[1].last)
    .map(([id]) => all.get(id)!);
}

export function buildReview(n = 20): Exercise[] {
  return shuffle(mistakes().slice(0, n));
}

/** Mastery 0..1. Conjugations: the 60 most recent drills. Items: all items of the topic. */
export function mastery(topic: Topic): number {
  const stats = allStats();
  const parts: number[] = [];
  const conj = conjExercises(topic);
  if (conj.length) {
    const seen = conj.filter((e) => stats[e.id]).sort((a, b) => stats[b.id].last - stats[a.id].last);
    const window = Math.min(60, conj.length);
    parts.push(seen.slice(0, window).reduce((s, e) => s + itemScore(e.id), 0) / window);
  }
  const items = itemExercises(topic);
  if (items.length) parts.push(items.reduce((s, e) => s + itemScore(e.id), 0) / items.length);
  return parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 0;
}

/** Answers given by the user: fill → one per blank; conjugate/choice → one value */
export function grade(ex: Exercise, answers: string[]): Verdict[] {
  switch (ex.kind) {
    case 'conjugate':
      return [check(answers[0] ?? '', [ex.answer], { allowSubject: true })];
    case 'choice':
      return [answers[0] === ex.answer ? 'ok' : 'wrong'];
    case 'fill':
      return blanksOf(ex.text).map((b, i) => check(answers[i] ?? '', b.answers));
  }
}

export function blankCount(ex: Exercise): number {
  return ex.kind === 'fill' ? blanksOf(ex.text).length : 1;
}

export interface TestSection {
  title: string;
  topic: string;
  exercises: Exercise[];
}

export interface TestSpec {
  id: 'verbos' | 'final';
  title: string;
  minutes: number;
  points: number;
  sections: TestSection[];
}

/** Pick fill items from a topic until about `blanks` gaps are reached */
function pickFill(topicId: string, blanks: number): Exercise[] {
  const t = topicById(topicId)!;
  const fills = shuffle(itemExercises(t).filter((e) => e.kind === 'fill'));
  const out: Exercise[] = [];
  let count = 0;
  let stories = 0;
  for (const e of fills) {
    const n = blankCount(e);
    if (count + n > blanks + 2) continue;
    // at most one multi-gap story per section, and it may fill at most ~60% of it
    if (n > 3 && (stories > 0 || n > blanks * 0.6)) continue;
    if (n > 3) stories++;
    out.push(e);
    count += n;
    if (count >= blanks) break;
  }
  return out;
}

export function buildTest(id: 'verbos' | 'final'): TestSpec {
  if (id === 'verbos') {
    return {
      id,
      title: 'Test de verbos (simulation)',
      minutes: 20,
      points: 1,
      sections: [
        { title: '1. Pretérito indefinido', topic: 'indefinido', exercises: pickFill('indefinido', 10) },
        { title: '2. Pretérito imperfecto', topic: 'imperfecto', exercises: pickFill('imperfecto', 10) },
        { title: '3. Pretérito perfecto', topic: 'perfecto', exercises: pickFill('perfecto', 10) },
      ],
    };
  }
  return {
    id,
    title: 'Examen final de gramática (simulation)',
    minutes: 60,
    points: 4,
    sections: [
      { title: '1. Indefinido vs imperfecto', topic: 'contraste-ind-imp', exercises: pickFill('contraste-ind-imp', 12) },
      { title: '2. Indefinido vs perfecto', topic: 'contraste-ind-perf', exercises: pickFill('contraste-ind-perf', 10) },
      { title: '3. Preposiciones', topic: 'preposiciones', exercises: pickFill('preposiciones', 10) },
      { title: '4. Objeto directo e indirecto', topic: 'pronombres', exercises: pickFill('pronombres', 10) },
      { title: '5. Hay / es / está', topic: 'ser-estar-hay', exercises: pickFill('ser-estar-hay', 10) },
    ],
  };
}
