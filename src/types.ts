export type Tense = 'presente' | 'indefinido' | 'imperfecto' | 'perfecto' | 'gerundio';

/** Theory blocks. Text supports **bold** and *italic*. */
export type Block =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; head?: string[]; rows: string[][] }
  | { type: 'tip'; text: string }
  | { type: 'conj'; tense: Tense; verbs: string[] };

/**
 * Hand-written exercise items.
 * fill: text with blanks written as [[answer|hint]]. Several accepted answers: [[fui/estuve|hint]].
 * choice: pick one option; use ___ in text for the gap.
 */
export type ItemDef =
  | { t: 'fill'; text: string; why?: string; title?: string }
  | { t: 'choice'; text: string; options: string[]; answer: string; why?: string };

export interface Topic {
  id: string;
  title: string;
  subtitle: string;
  stars: 1 | 2 | 3;
  /** Which tests this topic appears in */
  exam?: ('verbos' | 'final')[];
  theory: Block[];
  /** Generated conjugation drills */
  conj?: { tense: Tense; verbs?: string[] };
  items: ItemDef[];
}

export type Exercise =
  | {
      kind: 'conjugate';
      id: string;
      topic: string;
      verb: string;
      en: string;
      tense: Tense;
      person: number;
      answer: string;
    }
  | {
      /** whole conjugation table: all 6 persons of one verb in one tense */
      kind: 'table';
      id: string;
      topic: string;
      verb: string;
      en: string;
      tense: Tense;
      answers: string[];
    }
  | { kind: 'fill'; id: string; topic: string; text: string; why?: string; title?: string }
  | {
      kind: 'choice';
      id: string;
      topic: string;
      text: string;
      options: string[];
      answer: string;
      why?: string;
    };

export type Verdict = 'ok' | 'accent' | 'wrong';
