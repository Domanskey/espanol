import { describe, expect, it } from 'vitest';
import { TOPICS } from './topics';
import { blanksOf } from '../engine/check';
import { conjugate, VERBS } from './verbs';
import type { Tense } from '../types';

const known = new Set(VERBS.map((v) => v.inf));
const TENSES: Record<string, Tense[]> = {
  indefinido: ['indefinido'],
  imperfecto: ['imperfecto'],
  perfecto: ['perfecto'],
  'contraste-ind-imp': ['indefinido', 'imperfecto'],
  'contraste-ind-perf': ['indefinido', 'perfecto'],
  presente: ['presente'],
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

    const tenses = TENSES[topic.id];
    if (tenses) {
      it(`${topic.id}: verb answers match the conjugator`, () => {
        const bad: string[] = [];
        for (const it of topic.items) {
          if (it.t !== 'fill') continue;
          for (const b of blanksOf(it.text)) {
            if (!b.hint || !known.has(b.hint)) continue;
            const forms = tenses.flatMap((t) => [0, 1, 2, 3, 4, 5].map((p) => conjugate(b.hint!, t, p)));
            for (const a of b.answers) if (!forms.includes(a.toLowerCase())) bad.push(`${a} (${b.hint}) in "${it.text}"`);
          }
        }
        expect(bad).toEqual([]);
      });
    }
  }
});
