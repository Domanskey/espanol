import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Dashboard } from './Dashboard';
import { TopicPage } from './TopicPage';
import { TestPage } from './TestPage';
import { WritingPage } from './WritingPage';
import { PresentationPage } from './PresentationPage';
import { VerbsPage } from './VerbsPage';
import { Practice } from '../components/Practice';
import { ExerciseView } from '../components/ExerciseView';
import { TOPICS } from '../data/topics';
import { buildPractice, buildTest, conjExercises, itemExercises } from '../engine/session';

describe('pages render without crashing', () => {
  it('dashboard and tools', () => {
    expect(renderToString(<Dashboard />)).toContain('Topics');
    expect(renderToString(<WritingPage />)).toContain('Writing practice');
    expect(renderToString(<PresentationPage />)).toContain('fuimos');
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
  it('tests have enough items in each section', () => {
    for (const kind of ['verbos', 'final'] as const)
      for (const s of buildTest(kind).sections) expect(s.exercises.length, s.title).toBeGreaterThan(2);
  });
});
