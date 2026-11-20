import { useState } from 'react';
import type { Exercise, Tense } from '../types';
import { conjugate, DRILL_VERBS, getVerb, isIrregular, PERSONS, TENSE_LABEL, VERBS } from '../data/verbs';
import { ALL_TENSES, conjExercise, shuffle, tableExercise, TENSE_TOPIC } from '../engine/session';
import { getStat } from '../engine/progress';
import { BackLink } from '../components/common';
import { Practice } from '../components/Practice';

const TENSES: Tense[] = ['indefinido', 'imperfecto', 'perfecto', 'presente', 'gerundio'];
const mastered = (tense: Tense, inf: string, p: number) => (getStat(`c:${tense}:${inf}:${p}`)?.box ?? 0) >= 4;

export function VerbsPage() {
  const [verb, setVerb] = useState('tener');
  const [query, setQuery] = useState('');
  const [tenses, setTenses] = useState<Tense[]>(['indefinido']);
  const [mode, setMode] = useState<'single' | 'table'>('single');
  const [onlyIrregular, setOnlyIrregular] = useState(false);
  const [onlyWeak, setOnlyWeak] = useState(true);
  const [vosotros, setVosotros] = useState(true);
  const [count, setCount] = useState(20);
  const [session, setSession] = useState<Exercise[] | null>(null);

  const build = () => {
    const persons = vosotros ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 5];
    const verbsFor = (t: Tense) => DRILL_VERBS.filter((v) => !onlyIrregular || isIrregular(v, t));
    let pool: Exercise[];
    if (mode === 'table') {
      pool = tenses.flatMap((t) =>
        verbsFor(t)
          .filter((v) => !onlyWeak || !persons.every((p) => mastered(t, v, p)))
          .map((v) => tableExercise(v, t)),
      );
    } else {
      pool = tenses.flatMap((t) =>
        verbsFor(t).flatMap((v) =>
          persons.filter((p) => !onlyWeak || !mastered(t, v, p)).map((p) => conjExercise(TENSE_TOPIC[t], v, t, p)),
        ),
      );
    }
    return shuffle(pool).slice(0, mode === 'table' ? Math.ceil(count / 4) : count);
  };

  if (session)
    return (
      <div>
        <BackLink to="#/verbs" label="← Verbs" />
        <Practice title={`Drill: ${tenses.join(', ')}`} exercises={session} onNewRound={build} exitHref="#/verbs" />
        <p className="row center">
          <button className="btn ghost" onClick={() => setSession(null)}>
            Back to settings
          </button>
        </p>
      </div>
    );

  const q = query.toLowerCase();
  const matches = VERBS.filter((v) => !q || v.inf.includes(q) || v.en.includes(q));
  const v = getVerb(verb);
  const covered = ALL_TENSES.reduce((n, t) => n + [0, 1, 2, 3, 4, 5].filter((p) => mastered(t, verb, p)).length, 0);

  return (
    <div className="verbs">
      <BackLink />
      <h1>📖 Verbs</h1>
      <p className="muted">
        Every verb used on the platform ({DRILL_VERBS.length}) can be drilled in every person and tense.
      </p>

      <div className="card">
        <h2>Custom drill</h2>
        <div className="drill-options">
          <div>
            <span className="muted small">Tenses</span>
            <div className="row wrap">
              {TENSES.map((t) => (
                <label key={t} className="chip">
                  <input
                    type="checkbox"
                    checked={tenses.includes(t)}
                    onChange={() => setTenses((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))}
                  />
                  {TENSE_LABEL[t]}
                </label>
              ))}
            </div>
          </div>
          <div className="row wrap">
            <label className="chip">
              <input type="radio" checked={mode === 'single'} onChange={() => setMode('single')} /> Single forms
            </label>
            <label className="chip">
              <input type="radio" checked={mode === 'table'} onChange={() => setMode('table')} /> Whole tables (all persons)
            </label>
          </div>
          <div className="row wrap">
            <label className="chip">
              <input type="checkbox" checked={onlyWeak} onChange={() => setOnlyWeak(!onlyWeak)} /> Only forms I haven't mastered
            </label>
            <label className="chip">
              <input type="checkbox" checked={onlyIrregular} onChange={() => setOnlyIrregular(!onlyIrregular)} /> Only irregular
            </label>
            <label className="chip">
              <input type="checkbox" checked={vosotros} onChange={() => setVosotros(!vosotros)} /> Include vosotros
            </label>
            <label className="chip">
              Questions
              <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
                {[10, 20, 30, 50].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
          </div>
          <button className="btn primary" disabled={!tenses.length} onClick={() => setSession(build())}>
            ▶ Start drill
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Verb tables</h2>
        <div className="verb-picker">
          <input placeholder="Search verb (es / en)…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="verb-list">
            {matches.map((m) => (
              <button key={m.inf} className={`chip ${m.inf === verb ? 'selected' : ''}`} onClick={() => setVerb(m.inf)} title={m.en}>
                {m.inf}
              </button>
            ))}
          </div>
        </div>
        <div className="row spread">
          <h3>
            {verb} <span className="muted">({v.en})</span>
          </h3>
          {!v.impersonal && (
            <a className="btn primary" href={`#/verb/${encodeURIComponent(verb)}`}>
              ▶ Drill all forms of {verb}
            </a>
          )}
        </div>
        {!v.impersonal && <p className="muted small">Mastered forms: {covered} / 30</p>}
        <div className="table-wrap">
          <table className="conj">
            <thead>
              <tr>
                <th></th>
                {TENSES.map((t) => (
                  <th key={t}>
                    {TENSE_LABEL[t]}
                    {isIrregular(verb, t) && <span className="irr" title="irregular"> ●</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERSONS.map((p, i) => (
                <tr key={p}>
                  <td className="muted">{p}</td>
                  {TENSES.map((t) => {
                    const st = getStat(`c:${t}:${verb}:${i}`);
                    const cls = !st ? '' : st.box >= 4 ? 'cov-ok' : st.box <= 2 ? 'cov-bad' : '';
                    return (
                      <td key={t} className={cls}>
                        {v.impersonal && i !== 2 ? '—' : conjugate(verb, t, i)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small">● = irregular in this tense · green = mastered · red = recently wrong</p>
      </div>
    </div>
  );
}
