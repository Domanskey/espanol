import type { Verdict } from '../types';

const SUBJECTS = ['yo', 'tú', 'tu', 'él', 'el', 'ella', 'usted', 'nosotros', 'nosotras', 'vosotros', 'vosotras', 'ellos', 'ellas', 'ustedes'];

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[¡¿!?.,;:"“”()]/g, '')
    .replace(/[’`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function stripAccents(s: string): string {
  // keep ñ, strip other diacritics
  return s
    .replace(/ñ/g, '\u0000')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\u0000/g, 'ñ');
}

/** Remove a leading subject pronoun ("yo hablé" -> "hablé") */
function dropSubject(s: string): string {
  const [first, ...rest] = s.split(' ');
  if (rest.length && SUBJECTS.includes(first)) return rest.join(' ');
  return s;
}

/** answers: list of accepted answers */
export function check(input: string, answers: string[], opts: { allowSubject?: boolean } = {}): Verdict {
  let given = normalize(input);
  if (!given) return 'wrong';
  if (opts.allowSubject) given = dropSubject(given);
  const accepted = answers.map(normalize);
  if (accepted.includes(given)) return 'ok';
  const loose = stripAccents(given);
  if (accepted.some((a) => stripAccents(a) === loose)) return 'accent';
  return 'wrong';
}

export interface Blank {
  answers: string[];
  hint?: string;
}

export type Segment = string | Blank;

/** Parse "Ayer [[fui|ir]] al cine" into text and blank segments */
export function parseFill(text: string): Segment[] {
  const out: Segment[] = [];
  const re = /\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push({ answers: m[1].split('/').map((a) => a.trim()), hint: m[2]?.trim() || undefined });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function blanksOf(text: string): Blank[] {
  return parseFill(text).filter((s): s is Blank => typeof s !== 'string');
}

/** Plain text with blanks filled by the first accepted answer */
export function solvedText(text: string): string {
  return parseFill(text)
    .map((s) => (typeof s === 'string' ? s : s.answers[0]))
    .join('');
}
