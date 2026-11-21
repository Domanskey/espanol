import { describe, expect, it } from 'vitest';
import { TOPICS } from './topics';
import { blanksOf } from '../engine/check';
import { conjugate, personsFor, VERBS } from './verbs';
import type { Tense } from '../types';

const known = new Set(VERBS.map((v) => v.inf));
/** haber = impersonal "hay / había / hubo / ha habido", taught in ser-estar-hay */
const EXCEPTIONS = new Set(['haber']);
const ESTAR_IMP = ['estaba', 'estabas', 'estaba', 'estábamos', 'estabais', 'estaban'];
const ESTAR_PRES = ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'];
const ESTAR_IND = ['estuve', 'estuviste', 'estuvo', 'estuvimos', 'estuvisteis', 'estuvieron'];
const ESTAR_PERF = ['he estado', 'has estado', 'ha estado', 'hemos estado', 'habéis estado', 'han estado'];
const TENSES: Record<string, Tense[]> = {
  indefinido: ['indefinido'],
  imperfecto: ['imperfecto'],
  perfecto: ['perfecto'],
  'contraste-ind-imp': ['indefinido', 'imperfecto'],
  'contraste-ind-perf': ['indefinido', 'perfecto'],
  presente: ['presente'],
  gerundio: ['gerundio'],
  imperativo: ['imperativo'],
  'imperativo-neg': ['imperativo-neg'],
};

describe('content', () => {
  for (const topic of TOPICS) {
    it(`${topic.id}: items are well formed`, () => {
      const texts = new Set<string>();
      for (const it of topic.items) {
        expect(texts.has(it.text), `duplicate: ${it.text}`).toBe(false);
        texts.add(it.text);
        if (it.t === 'fill') expect(blanksOf(it.text).length, it.text).toBeGreaterThan(0);
        else expect(it.options, it.text).toContain(it.answer);
      }
    });

    it(`${topic.id}: every verb in a hint is a known verb (so all its forms are drilled)`, () => {
      const missing = new Set<string>();
      for (const it of topic.items) {
        if (it.t !== 'fill') continue;
        for (const b of blanksOf(it.text))
          if (b.hint && /^[a-záéíóúñ]+(ar|er|ir|ír)(se)?$/.test(b.hint) && !known.has(b.hint) && !EXCEPTIONS.has(b.hint))
            missing.add(b.hint);
      }
      expect([...missing]).toEqual([]);
    });

    const tenses = TENSES[topic.id];
    if (tenses) {
      it(`${topic.id}: verb answers match the conjugator`, () => {
        const bad: string[] = [];
        for (const it of topic.items) {
          if (it.t !== 'fill') continue;
          for (const b of blanksOf(it.text)) {
            if (!b.hint || !known.has(b.hint)) continue;
            const forms = tenses.flatMap((t) => personsFor(t).map((p) => conjugate(b.hint!, t, p)));
            if (tenses.includes('imperativo-neg')) forms.push(...forms.map((f) => f.replace(/^no /, '')));
            // estar + gerundio also exists in the past: estaba cenando
            if (tenses.includes('gerundio'))
              // estar + gerundio also exists in the past: estaba / estuve / he estado cenando
              for (const alt of [ESTAR_IMP, ESTAR_IND, ESTAR_PERF])
                forms.push(...forms.map((f) => f.split(' ').map((w) => (ESTAR_PRES.includes(w) ? alt[ESTAR_PRES.indexOf(w)] : w)).join(' ')));
            // at least one accepted answer must be a real form (others may be variants like "está duchándose")
            if (!b.answers.some((a) => forms.includes(a.toLowerCase()))) bad.push(`${b.answers.join('/')} (${b.hint}) in "${it.text}"`);
          }
        }
        expect(bad).toEqual([]);
      });
    }
  }
});
