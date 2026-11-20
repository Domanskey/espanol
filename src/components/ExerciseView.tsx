import { useEffect, useRef } from 'react';
import type { Exercise, Verdict } from '../types';
import { parseFill } from '../engine/check';
import { PERSONS, TENSE_LABEL } from '../data/verbs';
import { Rich } from './common';

interface Props {
  ex: Exercise;
  answers: string[];
  onChange: (answers: string[]) => void;
  /** null = not graded yet */
  verdicts: Verdict[] | null;
  /** Enter pressed in an input (practice mode: check) */
  onSubmit?: () => void;
  autoFocus?: boolean;
  /** test mode: don't show the solution/why below */
  hideSolution?: boolean;
}

export function ExerciseView({ ex, answers, onChange, verdicts, onSubmit, autoFocus, hideSolution }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const graded = verdicts !== null;

  useEffect(() => {
    if (autoFocus) rootRef.current?.querySelector<HTMLInputElement>('input')?.focus();
  }, [ex.id, autoFocus]);

  const set = (i: number, v: string) => {
    const next = [...answers];
    next[i] = v;
    onChange(next);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  const input = (i: number, size: number, label: string) => (
    <input
      key={i}
      className={`blank ${graded ? verdicts![i] : ''}`}
      value={answers[i] ?? ''}
      onChange={(e) => set(i, e.target.value)}
      onKeyDown={onKey}
      readOnly={graded}
      size={Math.max(size, 4)}
      autoComplete="off"
      autoCapitalize="off"
      spellCheck={false}
      aria-label={label}
    />
  );

  if (ex.kind === 'conjugate') {
    return (
      <div ref={rootRef} className="exercise">
        <div className="conj-prompt">
          <span className="tag">{TENSE_LABEL[ex.tense]}</span>
          <div className="conj-verb">
            {ex.verb} <span className="muted">({ex.en})</span>
          </div>
          <div className="conj-person">
            {PERSONS[ex.person]} {input(0, 14, 'answer')}
          </div>
        </div>
        {graded && !hideSolution && <Solution verdicts={verdicts!} solution={ex.answer} />}
      </div>
    );
  }

  if (ex.kind === 'choice') {
    const [before, after] = ex.text.split('___');
    const chosen = answers[0];
    return (
      <div ref={rootRef} className="exercise">
        <p className="sentence">
          {before}
          <span className="gap">{chosen ?? '___'}</span>
          {after}
        </p>
        <div className="options">
          {ex.options.map((o) => {
            let cls = 'option';
            if (graded) {
              if (o === ex.answer) cls += ' ok';
              else if (o === chosen) cls += ' wrong';
            } else if (o === chosen) cls += ' selected';
            return (
              <button key={o} className={cls} disabled={graded} onClick={() => onChange([o])}>
                {o}
              </button>
            );
          })}
        </div>
        {graded && !hideSolution && ex.why && (
          <p className="why">
            <Rich text={ex.why} />
          </p>
        )}
      </div>
    );
  }

  // fill
  const segs = parseFill(ex.text);
  let bi = -1;
  return (
    <div ref={rootRef} className="exercise">
      {ex.title && <h4 className="ex-title">{ex.title}</h4>}
      <p className={`sentence ${segs.length > 6 ? 'story' : ''}`}>
        {segs.map((s, i) => {
          if (typeof s === 'string') return <span key={i}>{s}</span>;
          bi++;
          const idx = bi;
          const v = graded ? verdicts![idx] : null;
          return (
            <span key={i} className="blank-wrap">
              {input(idx, Math.max(...s.answers.map((a) => a.length)) + 1, s.hint ?? `blank ${idx + 1}`)}
              {s.hint && <span className="hint">({s.hint})</span>}
              {graded && v !== 'ok' && !hideSolution && <span className="correction">{s.answers.join(' / ')}</span>}
            </span>
          );
        })}
      </p>
      {graded && !hideSolution && (
        <>
          {verdicts!.includes('accent') && <p className="accent-note">Check the accents: they matter (hablo ≠ habló).</p>}
          {ex.why && (
            <p className="why">
              <Rich text={ex.why} />
            </p>
          )}
        </>
      )}
    </div>
  );
}

function Solution({ verdicts, solution }: { verdicts: Verdict[]; solution: string }) {
  const v = verdicts[0];
  if (v === 'ok') return null;
  return (
    <p className={`solution ${v}`}>
      {v === 'accent' ? 'Almost, check the accent: ' : 'Correct answer: '}
      <strong>{solution}</strong>
    </p>
  );
}
