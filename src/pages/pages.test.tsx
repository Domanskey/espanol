import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Dashboard } from './Dashboard';
import { TopicPage } from './TopicPage';
import { TestPage } from './TestPage';
import { WritingPage } from './WritingPage';
import { VerbsPage } from './VerbsPage';
import { Practice } from '../components/Practice';
import { ExerciseView } from '../components/ExerciseView';
import { TOPICS } from '../data/topics';
import { buildPractice, buildTest, conjExercises, grade, itemExercises, tableExercises, verbOf, verbSession } from '../engine/session';
import { DRILL_VERBS, VERBS } from '../data/verbs';

describe('pages render without crashing', () => {
  it('dashboard and tools', () => {
    expect(renderToString(<Dashboard />)).toContain('Topics');
    expect(renderToString(<WritingPage />)).toContain('Writing practice');
    expect(renderToString(<VerbsPage />)).toContain('tuvieron');
    expect(renderToString(<TestPage kind="verbos" />)).toContain('20 minutes');
  });
  it.each(TOPICS.map((t) => [t.id, t] as const))('topic %s: page, practice and every exercise', (_, t) => {
    expect(renderToString(<TopicPage topic={t} />)).toContain(t.title);
    const ex = buildPractice(t);
    expect(ex.length).toBeGreaterThan(0);
    expect(renderToString(<Practice title={t.title} exercises={ex} />)).toContain('practice-head');
    for (const e of [...itemExercises(t), ...conjExercises(t).slice(0, 12)]) {
      renderToString(<ExerciseView ex={e} answers={[]} onChange={() => {}} verdicts={null} />);
    }
  });
  it('every drillable verb has a full table in all 5 tenses, and it renders', () => {
    expect(DRILL_VERBS.length).toBeGreaterThan(100);
    for (const inf of DRILL_VERBS) {
      const tables = verbSession(inf);
      expect(tables.length, inf).toBe(5);
      for (const t of tables) if (t.kind === 'table') expect(t.answers.length).toBe(6);
    }
    const salir = verbSession('salir');
    expect(renderToString(<ExerciseView ex={salir[0]} answers={[]} onChange={() => {}} verdicts={null} />)).toContain('salir');
    if (salir[0].kind === 'table') expect(grade(salir[0], salir[0].answers).every((v) => v === 'ok')).toBe(true);
  });
  it('impersonal verbs are excluded from person drills', () => {
    for (const v of VERBS.filter((x) => x.impersonal)) {
      expect(DRILL_VERBS).not.toContain(v.inf);
      expect(verbSession(v.inf)).toEqual([]);
    }
  });
  it('tense topics include whole tables in practice rounds', () => {
    const t = TOPICS.find((x) => x.id === 'indefinido')!;
    expect(tableExercises(t).length).toBe(DRILL_VERBS.length);
    expect(buildPractice(t).filter((e) => e.kind === 'table').length).toBe(3);
  });
  it('sentences link to their verb for "all forms of"', () => {
    const t = TOPICS.find((x) => x.id === 'indefinido')!;
    const withVerb = itemExercises(t).filter((e) => verbOf(e));
    expect(withVerb.length).toBeGreaterThan(30);
  });
  it('tests have enough items in each section', () => {
    for (const kind of ['verbos', 'final'] as const)
      for (const s of buildTest(kind).sections) expect(s.exercises.length, s.title).toBeGreaterThan(2);
  });
});
