import { useMemo, useState } from 'react';
import { conjugate, VERBS } from '../data/verbs';
import { stripAccents } from '../engine/check';
import { getNote, setNote } from '../engine/progress';
import { AccentBar, BackLink, TimerBadge, useCountdown } from '../components/common';

const PROMPTS: { title: string; questions: string[] }[] = [
  { title: 'Un viaje inolvidable', questions: ['¿Adónde fuiste, cuándo y con quién?', '¿Cómo era el lugar? ¿Qué tiempo hacía?', '¿Qué hiciste cada día?', '¿Pasó algo especial o divertido?', '¿Te gustó? ¿Por qué?'] },
  { title: 'Tu último fin de semana', questions: ['¿Qué hiciste el sábado y el domingo?', '¿Con quién estuviste?', '¿Dónde comiste / cenaste?', '¿Cómo te sentías al final?'] },
  { title: 'Un día de la semana pasada', questions: ['¿A qué hora te levantaste?', '¿Qué hiciste por la mañana, por la tarde y por la noche?', 'Usa: al principio, después de + infinitivo, luego, más tarde, al final'] },
  { title: 'Tu infancia', questions: ['¿Dónde vivías cuando eras pequeño/a? ¿Cómo era tu casa?', '¿Qué hacías normalmente después del colegio?', '¿Cómo eran tus amigos?', 'Cuenta un día especial de tu infancia: ¿qué pasó?'] },
  { title: 'La biografía de una persona de tu familia', questions: ['¿Dónde y cuándo nació?', '¿Cómo era de joven?', '¿Qué estudió? ¿Dónde trabajó?', '¿Qué momentos importantes hubo en su vida?'] },
  { title: 'La biografía de una persona famosa', questions: ['¿Dónde y cuándo nació?', '¿Cómo era su vida de niño/a?', '¿Qué hizo? ¿Por qué es famosa?', '¿Cuándo murió / qué hace ahora?'] },
  { title: 'Tu primer día en Valencia', questions: ['¿Cuándo llegaste? ¿Cómo viajaste?', '¿Qué tiempo hacía? ¿Cómo era tu piso?', '¿Qué hiciste el primer día?', '¿A quién conociste?'] },
  { title: 'Un día en que todo salió mal', questions: ['¿Cuándo fue?', '¿Qué estabas haciendo cuando empezó el problema?', '¿Qué pasó después?', '¿Cómo terminó el día?'] },
  { title: 'Una fiesta o celebración especial', questions: ['¿Qué celebrabais? ¿Dónde fue?', '¿Cuánta gente había? ¿Cómo era el lugar?', '¿Qué comisteis y bebisteis?', '¿Qué fue lo mejor?'] },
  { title: 'Cómo conociste a tu mejor amigo/a', questions: ['¿Cuándo y dónde os conocisteis?', '¿Cómo era él/ella entonces?', '¿Qué hicisteis juntos/as la primera vez?', '¿Qué cosas hacíais normalmente?'] },
  { title: 'Un concierto o evento al que fuiste', questions: ['¿Qué evento fue? ¿Cuándo?', '¿Cómo era el ambiente? ¿Había mucha gente?', '¿Qué pasó durante el evento?', '¿Qué hiciste después?'] },
  { title: 'Tu mejor verano', questions: ['¿Qué año fue? ¿Dónde estuviste?', '¿Qué hacías cada día?', '¿Pasó algo especial?', '¿Por qué fue el mejor?'] },
];

const CHECKLIST = [
  '**Indefinido** for the events: fui, visité, comí, llegamos…',
  '**Imperfecto** for 4–5 descriptions: era, había, hacía calor, estaba…',
  'Time markers: el verano pasado, al principio, después de + inf., luego, más tarde, al final',
  'Connectors: porque, pero, así que, aunque, por eso',
  'Accents: llegué, comió, visitó, había, era…',
  'Irregulars: fui, estuve, tuve, hice, pude, vine, dije…',
  '12–15 lines ≈ 120–180 words',
  'No translator. Only a simple dictionary (WordReference) if needed',
];

const MODEL = `El verano pasado fui a Praga con dos amigos de la universidad. Llegamos un viernes por la mañana en avión. La ciudad era preciosa: había muchos edificios antiguos y las calles eran estrechas. Hacía mucho calor y siempre había turistas en el centro.

El primer día visitamos el castillo y paseamos por el puente de Carlos. Por la noche cenamos en un restaurante típico y probamos la comida checa. Al día siguiente, mientras mis amigos dormían, yo me levanté temprano y saqué fotos del río. Después de desayunar, fuimos a un museo muy interesante.

El último día tuvimos un problema: ¡perdimos el autobús al aeropuerto! Al final cogimos un taxi y llegamos a tiempo. Fue un viaje fantástico y quiero volver pronto.`;

// Word-form sets for a quick tense count
function buildForms() {
  const ind = new Set<string>();
  const imp = new Set<string>();
  const parts = new Set<string>();
  for (const v of VERBS)
    for (let p = 0; p < 6; p++) {
      ind.add(conjugate(v.inf, 'indefinido', p).split(' ').pop()!);
      imp.add(conjugate(v.inf, 'imperfecto', p).split(' ').pop()!);
      parts.add(conjugate(v.inf, 'perfecto', p).split(' ').pop()!);
    }
  ['hubo', 'nació', 'nacimos', 'nacieron', 'murió'].forEach((f) => ind.add(f));
  imp.add('había');
  const loose = new Map<string, string>();
  for (const f of [...ind, ...imp]) if (stripAccents(f) !== f) loose.set(stripAccents(f), f);
  return { ind, imp, parts, loose };
}

function analyse(text: string, forms: ReturnType<typeof buildForms>) {
  const words = text.toLowerCase().match(/[a-záéíóúüñ]+/g) ?? [];
  let ind = 0;
  let imp = 0;
  let perf = 0;
  const accents = new Set<string>();
  const HABER = new Set(['he', 'has', 'ha', 'hemos', 'habéis', 'han']);
  words.forEach((w, i) => {
    if (HABER.has(w) && forms.parts.has(words[i + 1] ?? '')) perf++;
    else if (forms.ind.has(w)) ind++;
    else if (forms.imp.has(w)) imp++;
    else if (forms.loose.has(w)) accents.add(`${w} → ${forms.loose.get(w)}?`);
  });
  return { words: words.length, ind, imp, perf, accents: [...accents] };
}

export function WritingPage() {
  const [pi, setPi] = useState(() => Math.floor(Math.random() * PROMPTS.length));
  const [text, setText] = useState(() => getNote('writing'));
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useCountdown(45 * 60, running, () => setRunning(false));
  const [showModel, setShowModel] = useState(false);
  const [checked, setChecked] = useState<boolean[]>([]);
  const forms = useMemo(buildForms, []);
  const a = analyse(text, forms);
  const prompt = PROMPTS[pi];

  const update = (v: string) => {
    setText(v);
    setNote('writing', v);
  };

  return (
    <div className="writing">
      <BackLink />
      <h1>✍️ Writing practice</h1>
      <p className="muted">
        Exam (17 Dec, 2 pts): a text in the past, <strong>12–15 lines</strong>, topic chosen by the teacher, <strong>45 minutes</strong>. Practise
        with a random topic, then go through the checklist.
      </p>

      <div className="card prompt">
        <div className="row spread">
          <h2>{prompt.title}</h2>
          <button className="btn ghost" onClick={() => setPi((pi + 1 + Math.floor(Math.random() * (PROMPTS.length - 1))) % PROMPTS.length)}>
            🎲 Other topic
          </button>
        </div>
        <ul>
          {prompt.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </div>

      <div className="writing-grid">
        <div>
          <div className="row spread">
            <div className="row">
              <TimerBadge left={left} total={45 * 60} />
              <button className="btn small" onClick={() => setRunning(!running)}>
                {running ? 'Pause' : left < 45 * 60 ? 'Resume' : 'Start 45 min'}
              </button>
              <button
                className="btn small ghost"
                onClick={() => {
                  setRunning(false);
                  setLeft(45 * 60);
                }}
              >
                Reset
              </button>
            </div>
            <span className={`muted small ${a.words >= 120 && a.words <= 200 ? 'good-text' : ''}`}>{a.words} words (target 120–180)</span>
          </div>
          <textarea value={text} onChange={(e) => update(e.target.value)} placeholder="El verano pasado fui a…" rows={16} spellCheck={false} />
          <AccentBar />
          <div className="row">
            <button
              className="btn small ghost"
              onClick={() => {
                if (!text || confirm('Clear the text?')) update('');
              }}
            >
              Clear
            </button>
          </div>
        </div>
        <aside>
          <div className="card">
            <h3>Quick analysis</h3>
            <ul className="plain">
              <li>
                Indefinido forms: <strong>{a.ind}</strong>
              </li>
              <li>
                Imperfecto forms: <strong>{a.imp}</strong> {a.imp < 4 && a.words > 40 && <span className="muted">(aim for 4–5 descriptions)</span>}
              </li>
              <li>
                Perfecto forms: <strong>{a.perf}</strong> {a.perf > 0 && <span className="muted">(only for "hoy / este año…")</span>}
              </li>
            </ul>
            {a.accents.length > 0 && (
              <>
                <p className="small">
                  <strong>Possible missing accents:</strong>
                </p>
                <ul className="plain small">
                  {a.accents.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </>
            )}
            <p className="muted small">Detects common verbs only. It doesn't replace a teacher!</p>
          </div>
          <div className="card">
            <h3>Checklist</h3>
            {CHECKLIST.map((c, i) => (
              <label key={i} className="check">
                <input type="checkbox" checked={!!checked[i]} onChange={() => setChecked((p) => Object.assign([...p], { [i]: !p[i] }))} />
                <span dangerouslySetInnerHTML={{ __html: c.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') }} />
              </label>
            ))}
          </div>
          <div className="card">
            <button className="btn ghost small" onClick={() => setShowModel(!showModel)}>
              {showModel ? 'Hide' : 'Show'} model text (trip)
            </button>
            {showModel && <div className="model">{MODEL}</div>}
          </div>
        </aside>
      </div>
    </div>
  );
}
