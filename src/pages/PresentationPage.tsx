import { useState } from 'react';
import { conjugate, getVerb } from '../data/verbs';
import { conjExercise, shuffle } from '../engine/session';
import { getNote, setNote } from '../engine/progress';
import { BackLink, fmtTime, useCountdown } from '../components/common';
import { Practice } from '../components/Practice';

const TRIP_VERBS = [
  'ir', 'viajar', 'llegar', 'estar', 'visitar', 'ver', 'comer', 'probar', 'conocer', 'hacer',
  'tener', 'comprar', 'pasear', 'salir', 'volver', 'quedarse', 'coger', 'dormir', 'perder', 'poder',
];

const DESCRIPTIONS = [
  'La ciudad **era** muy bonita / antigua / grande',
  '**Hacía** sol / calor / frío · **Llovía** mucho',
  '**Había** mucha gente / muchos turistas',
  'El hotel **estaba** en el centro y **tenía** piscina',
  'La gente **era** muy simpática',
  'Mientras **paseábamos**, …',
];

const STRUCTURE = [
  { h: '1. Introducción (20 s)', p: '¿Adónde fuiste? ¿Cuándo? ¿Con quién? ¿Cómo viajaste?', ex: 'En el verano de 2023 fui a Roma con mi familia. Viajamos en avión.' },
  { h: '2. Descripción (30 s): imperfecto', p: 'How was the place, the weather, the hotel, the people?', ex: 'Roma era preciosa. Hacía mucho calor y había muchos turistas.' },
  { h: '3. Lo que hiciste (90 s): indefinido', p: 'Day by day: el primer día… después… al día siguiente… el último día…', ex: 'El primer día visitamos el Coliseo. Después comimos pizza en una plaza.' },
  { h: '4. Una anécdota (30 s)', p: 'Something funny or unexpected: imperfecto (scene) + indefinido (event)', ex: 'Mientras hacíamos fotos, mi hermano perdió su móvil…' },
  { h: '5. Conclusión (10 s)', p: '¿Te gustó? ¿Volverías?', ex: 'Fue un viaje increíble. Me gustó mucho la comida.' },
];

function bold(s: string) {
  return <span dangerouslySetInnerHTML={{ __html: s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') }} />;
}

export function PresentationPage() {
  const [notes, setNotes] = useState(() => getNote('presentation'));
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useCountdown(180, running, () => setRunning(false));
  const [drill, setDrill] = useState(false);

  const buildDrill = () => shuffle(TRIP_VERBS.flatMap((v) => [0, 3].map((p) => conjExercise('indefinido', v, 'indefinido', p)))).slice(0, 15);

  if (drill)
    return (
      <div>
        <BackLink to="#/presentation" label="← Presentation" />
        <Practice title="Trip verbs: yo / nosotros (indefinido)" exercises={buildDrill()} onNewRound={buildDrill} exitHref="#/presentation" />
        <p className="row center">
          <button className="btn ghost" onClick={() => setDrill(false)}>
            Back to presentation
          </button>
        </p>
      </div>
    );

  return (
    <div className="presentation">
      <BackLink />
      <h1>🎤 Presentation prep</h1>
      <div className="card">
        <ul>
          <li>
            <strong>3 minutes</strong> about an interesting trip in your life (2 pts)
          </li>
          <li>
            <strong>Pretérito indefinido</strong> for the events + <strong>4–5 descriptions in imperfecto</strong>
          </li>
          <li>
            Slides: <strong>no verbs</strong>, only nouns and pictures. <strong>No paper</strong> while presenting.
          </li>
        </ul>
      </div>

      <div className="card timer-card">
        <span className={`huge ${left <= 30 ? 'warn' : ''}`}>{fmtTime(left)}</span>
        <div className="row center">
          <button className="btn primary" onClick={() => setRunning(!running)}>
            {running ? 'Pause' : 'Start 3:00'}
          </button>
          <button
            className="btn ghost"
            onClick={() => {
              setRunning(false);
              setLeft(180);
            }}
          >
            Reset
          </button>
        </div>
        <p className="muted small">Practise out loud. Aim to finish between 2:45 and 3:15.</p>
      </div>

      <h2>Structure</h2>
      <div className="structure">
        {STRUCTURE.map((s) => (
          <div key={s.h} className="card">
            <strong>{s.h}</strong>
            <p className="muted small">{s.p}</p>
            <p>
              <em>{s.ex}</em>
            </p>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div className="card">
          <h3>Trip verbs (indefinido)</h3>
          <table className="conj">
            <thead>
              <tr>
                <th></th>
                <th>yo</th>
                <th>nosotros</th>
              </tr>
            </thead>
            <tbody>
              {TRIP_VERBS.map((v) => (
                <tr key={v}>
                  <td className="muted" title={getVerb(v).en}>
                    {v}
                  </td>
                  <td>{conjugate(v, 'indefinido', 0)}</td>
                  <td>{conjugate(v, 'indefinido', 3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn primary" onClick={() => setDrill(true)}>
            ▶ Drill these verbs
          </button>
        </div>
        <div className="card">
          <h3>Descriptions (imperfecto)</h3>
          <ul>
            {DESCRIPTIONS.map((d) => (
              <li key={d}>{bold(d)}</li>
            ))}
          </ul>
          <h3>Linking words</h3>
          <p>
            al principio · el primer día · después · luego · al día siguiente · más tarde · por la noche · de repente · al final · el último día · por eso ·
            pero · así que
          </p>
        </div>
      </div>

      <div className="card">
        <h3>My notes / script</h3>
        <p className="muted small">Write your story here to prepare (saved automatically), then practise without it!</p>
        <textarea
          rows={10}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setNote('presentation', e.target.value);
          }}
          placeholder="En el verano de… fui a…"
        />
      </div>
    </div>
  );
}
