import { useMemo, useState } from 'react';
import type { Verdict } from '../types';
import { blankCount, buildTest, grade, recordResult, type TestSpec } from '../engine/session';
import { AccentBar, BackLink, Bar, TimerBadge, useCountdown } from '../components/common';
import { ExerciseView } from '../components/ExerciseView';

export function TestPage({ kind }: { kind: 'verbos' | 'final' }) {
  const [spec, setSpec] = useState<TestSpec | null>(null);
  if (!spec) return <TestIntro kind={kind} onStart={() => setSpec(buildTest(kind))} />;
  return <TestRunner key={spec.sections.map((s) => s.exercises.map((e) => e.id).join()).join()} spec={spec} onRestart={() => setSpec(buildTest(kind))} />;
}

function TestIntro({ kind, onStart }: { kind: 'verbos' | 'final'; onStart: () => void }) {
  return (
    <div>
      <BackLink />
      <div className="card intro">
        {kind === 'verbos' ? (
          <>
            <h1>📝 Test de verbos: simulation</h1>
            <ul>
              <li>
                <strong>20 minutes</strong>, worth <strong>1 point</strong> in the course
              </li>
              <li>3 fill-the-gap exercises: pretérito indefinido, imperfecto and perfecto</li>
              <li>No feedback until you submit, just like the real test</li>
            </ul>
          </>
        ) : (
          <>
            <h1>🎓 Examen final de gramática: simulation</h1>
            <ul>
              <li>
                <strong>60 minutes</strong>, worth <strong>4 points</strong> in the course (real exam: 17 December)
              </li>
              <li>Fill the gaps in 5 parts: indefinido vs imperfecto, indefinido vs perfecto, preposiciones, objeto directo/indirecto, hay/es/está</li>
              <li>The written text (2 pts) is practised separately in <a href="#/writing">Writing practice</a></li>
            </ul>
          </>
        )}
        <p className="muted small">Missing accents count as mistakes. Use the accent buttons or your keyboard.</p>
        <button className="btn primary big" onClick={onStart}>
          Start
        </button>
      </div>
    </div>
  );
}

function TestRunner({ spec, onRestart }: { spec: TestSpec; onRestart: () => void }) {
  const all = useMemo(() => spec.sections.flatMap((s) => s.exercises), [spec]);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [graded, setGraded] = useState<Record<string, Verdict[]> | null>(null);

  const submit = () => {
    if (graded) return;
    const g: Record<string, Verdict[]> = {};
    for (const ex of all) {
      g[ex.id] = grade(ex, answers[ex.id] ?? []);
      recordResult(ex, g[ex.id]);
    }
    setGraded(g);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [left] = useCountdown(spec.minutes * 60, !graded, submit);

  const totalBlanks = all.reduce((s, e) => s + blankCount(e), 0);
  const okBlanks = graded ? Object.values(graded).flat().filter((v) => v === 'ok').length : 0;
  const filled = all.reduce((s, e) => s + (answers[e.id] ?? []).filter((a) => a?.trim()).length, 0);

  return (
    <div className="test">
      <div className="test-bar">
        <BackLink />
        <strong>{spec.title}</strong>
        {graded ? <span className="muted">finished</span> : <TimerBadge left={left} total={spec.minutes * 60} />}
        {!graded && (
          <span className="muted small">
            {filled}/{totalBlanks} filled
          </span>
        )}
      </div>

      {graded && (
        <div className="card summary">
          <h2>Result</h2>
          <p className="big-score">
            {((okBlanks / totalBlanks) * spec.points).toFixed(2)} / {spec.points} pts
          </p>
          <p className="muted">
            {okBlanks} of {totalBlanks} gaps correct ({Math.round((okBlanks / totalBlanks) * 100)}%)
          </p>
          <div className="section-scores">
            {spec.sections.map((s) => {
              const v = s.exercises.flatMap((e) => graded[e.id]);
              const ok = v.filter((x) => x === 'ok').length;
              return (
                <div key={s.title} className="section-score">
                  <span>{s.title}</span>
                  <span className="muted">
                    {ok}/{v.length}
                  </span>
                  <Bar value={v.length ? ok / v.length : 0} />
                  {ok < v.length && (
                    <a className="small" href={`#/practice/${s.topic}`}>
                      practise →
                    </a>
                  )}
                </div>
              );
            })}
          </div>
          <div className="row">
            <button className="btn primary" onClick={onRestart}>
              New test
            </button>
            <a className="btn ghost" href="#/">
              Dashboard
            </a>
          </div>
          <p className="muted small">Scroll down to see your corrections.</p>
        </div>
      )}

      {spec.sections.map((s) => (
        <section key={s.title} className="card test-section">
          <h2>{s.title}</h2>
          <p className="muted small">Complete with the correct form.</p>
          {s.exercises.map((ex) => (
            <div key={ex.id} className="test-item">
              <ExerciseView
                ex={ex}
                answers={answers[ex.id] ?? []}
                onChange={(a) => setAnswers((prev) => ({ ...prev, [ex.id]: a }))}
                verdicts={graded ? graded[ex.id] : null}
              />
            </div>
          ))}
        </section>
      ))}

      {!graded && (
        <>
          <div className="sticky-bottom">
            <AccentBar />
            <button
              className="btn primary"
              onClick={() => {
                if (filled < totalBlanks && !confirm(`${totalBlanks - filled} gaps are empty. Submit anyway?`)) return;
                submit();
              }}
            >
              Submit
            </button>
          </div>
        </>
      )}
    </div>
  );
}
