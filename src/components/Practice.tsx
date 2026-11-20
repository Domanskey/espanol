import { useEffect, useState } from 'react';
import type { Exercise, Verdict } from '../types';
import { grade, recordResult, topicById, verbOf } from '../engine/session';
import { AccentBar, Bar } from './common';
import { ExerciseView } from './ExerciseView';

interface Result {
  ex: Exercise;
  answers: string[];
  verdicts: Verdict[];
}

interface Props {
  title: string;
  exercises: Exercise[];
  /** build a fresh round */
  onNewRound?: () => Exercise[];
  exitHref?: string;
}

export function Practice({ title, exercises: initial, onNewRound, exitHref = '#/' }: Props) {
  const [exercises, setExercises] = useState(initial);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [verdicts, setVerdicts] = useState<Verdict[] | null>(null);
  const [results, setResults] = useState<Result[]>([]);

  const ex = exercises[idx];
  const done = idx >= exercises.length;

  const start = (list: Exercise[]) => {
    setExercises(list);
    setIdx(0);
    setAnswers([]);
    setVerdicts(null);
    setResults([]);
  };

  const checkNow = (ans = answers) => {
    if (!ex || verdicts) return;
    const v = grade(ex, ans);
    setVerdicts(v);
    recordResult(ex, v);
    setResults((r) => [...r, { ex, answers: ans, verdicts: v }]);
  };

  const next = () => {
    setIdx((i) => i + 1);
    setAnswers([]);
    setVerdicts(null);
  };

  // Enter → next question once graded
  useEffect(() => {
    if (!verdicts) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        next();
      }
    };
    // attach on next tick so the Enter that triggered "check" doesn't also skip
    const t = setTimeout(() => window.addEventListener('keydown', h), 0);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', h);
    };
  }, [verdicts]);

  if (!exercises.length) {
    return (
      <div className="card">
        <p>Nothing to practise here. 🎉</p>
        <a className="btn" href={exitHref}>
          Back
        </a>
      </div>
    );
  }

  if (done) {
    const correct = results.filter((r) => r.verdicts.every((v) => v === 'ok')).length;
    const wrong = results.filter((r) => !r.verdicts.every((v) => v === 'ok'));
    const pct = correct / results.length;
    return (
      <div className="card summary">
        <h2>
          {pct >= 0.9 ? '¡Excelente! 🎉' : pct >= 0.7 ? '¡Muy bien! 👏' : pct >= 0.5 ? 'Bien, ¡sigue así! 💪' : '¡Ánimo! Keep practising 📚'}
        </h2>
        <p className="big-score">
          {correct} / {results.length}
        </p>
        <Bar value={pct} />
        {wrong.length > 0 && (
          <>
            <h3>To review</h3>
            <ul className="mistakes">
              {wrong.map((r) => (
                <li key={r.ex.id}>
                  <MistakeLine r={r} />
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="row">
          {wrong.length > 0 && (
            <button className="btn" onClick={() => start(wrong.map((r) => r.ex))}>
              Redo mistakes ({wrong.length})
            </button>
          )}
          {onNewRound && (
            <button className="btn primary" onClick={() => start(onNewRound())}>
              New round
            </button>
          )}
          <a className="btn ghost" href={exitHref}>
            Done
          </a>
        </div>
      </div>
    );
  }

  const topic = topicById(ex.topic);
  const canCheck = ex.kind === 'choice' ? answers[0] !== undefined : answers.some((a) => a?.trim());
  const allOk = verdicts?.every((v) => v === 'ok');
  const verb = verbOf(ex);

  return (
    <div className="practice">
      <div className="practice-head">
        <span>{title}</span>
        <span className="muted">
          {idx + 1} / {exercises.length}
        </span>
      </div>
      <div className="progress-line">
        <div style={{ width: `${(idx / exercises.length) * 100}%` }} />
      </div>
      <div className={`card exercise-card ${verdicts ? (allOk ? 'is-ok' : 'is-wrong') : ''}`}>
        {topic && exercises.some((e) => e.topic !== ex.topic) && <div className="tag small">{topic.title}</div>}
        <ExerciseView
          ex={ex}
          answers={answers}
          onChange={(a) => {
            setAnswers(a);
            if (ex.kind === 'choice') checkNow(a);
          }}
          verdicts={verdicts}
          onSubmit={() => !verdicts && canCheck && checkNow()}
          autoFocus
        />
        {verdicts && (
          <div className={`verdict ${allOk ? 'ok' : 'wrong'}`}>
            {allOk ? '✓ ¡Correcto!' : verdicts.includes('accent') && !verdicts.includes('wrong') ? '≈ Almost: accents' : '✗ Not quite'}
            <span className="verdict-links">
              {verb && ex.kind !== 'table' && (
                <a className="theory-link" href={`#/verb/${encodeURIComponent(verb)}`} target="_blank" rel="noreferrer">
                  all forms of <em>{verb}</em> ↗
                </a>
              )}
              {topic && !allOk && (
                <a className="theory-link" href={`#/topic/${topic.id}`} target="_blank" rel="noreferrer">
                  theory ↗
                </a>
              )}
            </span>
          </div>
        )}
      </div>
      {ex.kind !== 'choice' && !verdicts && <AccentBar />}
      <div className="row end">
        {!verdicts ? (
          <>
            <button className="btn ghost" onClick={() => checkNow(answers.length ? answers : [''])}>
              I don't know
            </button>
            {ex.kind !== 'choice' && (
              <button className="btn primary" disabled={!canCheck} onClick={() => checkNow()}>
                Check ⏎
              </button>
            )}
          </>
        ) : (
          <button className="btn primary" onClick={next}>
            Next ⏎
          </button>
        )}
      </div>
    </div>
  );
}

function MistakeLine({ r }: { r: Result }) {
  const { ex } = r;
  if (ex.kind === 'conjugate')
    return (
      <>
        {ex.verb}, {['yo', 'tú', 'él', 'nosotros', 'vosotros', 'ellos'][ex.person]}: <strong>{ex.answer}</strong>{' '}
        {r.answers[0] && <span className="muted">(you: {r.answers[0]})</span>}
      </>
    );
  if (ex.kind === 'table')
    return (
      <>
        {ex.verb} ({ex.tense}): <strong>{ex.answers.join(', ')}</strong>
      </>
    );
  if (ex.kind === 'choice')
    return (
      <>
        {ex.text.replace('___', `[${ex.answer}]`)}
      </>
    );
  return (
    <>
      {ex.title ? <em>{ex.title}: </em> : null}
      {ex.text.replace(/\[\[([^\]|]+)(\|[^\]]*)?\]\]/g, (_, a: string) => `[${a.split('/')[0]}]`)}
    </>
  );
}
