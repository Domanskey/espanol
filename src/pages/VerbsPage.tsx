import { useState } from 'react';
import type { Exercise, Tense } from '../types';
import { conjugate, isIrregular, PERSONS, TENSE_LABEL, VERBS } from '../data/verbs';
import { conjExercise, shuffle } from '../engine/session';
import { BackLink } from '../components/common';
import { Practice } from '../components/Practice';

const TENSES: Tense[] = ['indefinido', 'imperfecto', 'perfecto', 'presente', 'gerundio'];
const TOPIC_FOR: Record<Tense, string> = {
  indefinido: 'indefinido',
  imperfecto: 'imperfecto',
  perfecto: 'perfecto',
  presente: 'presente',
  gerundio: 'gerundio',
};

export function VerbsPage() {
  const [verb, setVerb] = useState('tener');
  const [query, setQuery] = useState('');
  const [tenses, setTenses] = useState<Tense[]>(['indefinido']);
  const [onlyIrregular, setOnlyIrregular] = useState(false);
  const [vosotros, setVosotros] = useState(true);
  const [count, setCount] = useState(20);
  const [session, setSession] = useState<Exercise[] | null>(null);

  const build = () => {
    const persons = vosotros ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 5];
    const pool = tenses.flatMap((t) =>
      VERBS.filter((v) => !onlyIrregular || isIrregular(v.inf, t)).flatMap((v) => persons.map((p) => conjExercise(TOPIC_FOR[t], v.inf, t, p))),
    );
    return shuffle(pool).slice(0, count);
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

  const matches = VERBS.filter((v) => !query || v.inf.includes(query.toLowerCase()) || v.en.includes(query.toLowerCase()));

  return (
    <div className="verbs">
      <BackLink />
      <h1>📖 Verbs</h1>

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
            {matches.map((v) => (
              <button key={v.inf} className={`chip ${v.inf === verb ? 'selected' : ''}`} onClick={() => setVerb(v.inf)} title={v.en}>
                {v.inf}
              </button>
            ))}
          </div>
        </div>
        <h3>
          {verb} <span className="muted">({VERBS.find((v) => v.inf === verb)?.en})</span>
        </h3>
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
                  {TENSES.map((t) => (
                    <td key={t}>{conjugate(verb, t, i)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small">● = something irregular in this tense</p>
      </div>
    </div>
  );
}
