import { useState } from 'react';
import { TOPICS } from '../data/topics';
import { mastery, mistakes } from '../engine/session';
import { answersToday, resetProgress, streak } from '../engine/progress';
import { Bar, Stars } from '../components/common';

export const DATES = [
  { label: 'Test de verbos', date: '2026-11-24', note: '20 min · 1 pt · the 3 past tenses (date depends on class progress)', href: '#/test/verbos' },
  { label: 'Examen final + texto', date: '2026-12-17', note: 'Grammar 4 pts (fill the gaps) + written text 2 pts', href: '#/test/final' },
];

export function daysUntil(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((target - today) / 86_400_000);
}

export function Dashboard() {
  const [, force] = useState(0);
  const scored = TOPICS.map((t) => ({ t, m: mastery(t) }));
  const weakestCore = [...scored].filter((s) => s.t.stars >= 2).sort((a, b) => a.m - b.m)[0];
  const nMistakes = mistakes().length;
  const verbTestDays = daysUntil(DATES[0].date);
  const upcoming = DATES.filter((d) => daysUntil(d.date) >= 0);

  return (
    <div className="dashboard">
      <header className="hero">
        <div>
          <h1>Español A2 · Práctica</h1>
          <p className="muted">Practise the grammar that is graded. Short theory, lots of exercises.</p>
        </div>
        <div className="stats">
          <div>
            <strong>{answersToday()}</strong>
            <span>answers today</span>
          </div>
          <div>
            <strong>{streak()} 🔥</strong>
            <span>day streak</span>
          </div>
        </div>
      </header>

      {verbTestDays >= 0 && verbTestDays <= 7 && (
        <div className="banner">
          <strong>Test de verbos in {verbTestDays === 0 ? 'today' : `${verbTestDays} day${verbTestDays === 1 ? '' : 's'}`}!</strong> Focus on the 3 past tenses:{' '}
          <a href="#/topic/indefinido">indefinido</a>, <a href="#/topic/imperfecto">imperfecto</a>, <a href="#/topic/perfecto">perfecto</a>, then
          take the <a href="#/test/verbos">simulation</a>.
        </div>
      )}

      <section className="countdowns">
        {upcoming.map((d) => {
          const n = daysUntil(d.date);
          return (
            <a key={d.label} className="card countdown" href={d.href}>
              <span className="days">{n}</span>
              <span className="days-label">day{n === 1 ? '' : 's'}</span>
              <strong>{d.label}</strong>
              <span className="muted small">
                {new Date(`${d.date}T12:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} · {d.note}
              </span>
            </a>
          );
        })}
      </section>

      <section className="quick">
        {weakestCore && (
          <a className="btn primary big" href={`#/practice/${weakestCore.t.id}`}>
            ▶ Practise weakest: {weakestCore.t.title}
          </a>
        )}
        <a className={`btn big ${nMistakes ? '' : 'disabled'}`} href={nMistakes ? '#/review' : undefined}>
          ↻ Review mistakes ({nMistakes})
        </a>
        <a className="btn big" href="#/test/verbos">
          📝 Verb test (20 min)
        </a>
        <a className="btn big" href="#/test/final">
          🎓 Final exam simulation
        </a>
      </section>

      <section>
        <h2>Topics</h2>
        <div className="topics">
          {scored.map(({ t, m }) => (
            <a key={t.id} className="card topic" href={`#/topic/${t.id}`}>
              <div className="topic-head">
                <Stars n={t.stars} />
                {t.exam?.includes('final') && <span className="tag small">examen</span>}
                {t.exam?.includes('verbos') && <span className="tag small">test verbos</span>}
              </div>
              <strong>{t.title}</strong>
              <span className="muted small">{t.subtitle}</span>
              <Bar value={m} />
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2>Tools</h2>
        <div className="tools">
          <a className="card tool" href="#/writing">
            <span className="icon">✍️</span>
            <strong>Writing practice</strong>
            <span className="muted small">Exam text: 12–15 lines in the past, 45 min, random topic</span>
          </a>
          <a className="card tool" href="#/verbs">
            <span className="icon">📖</span>
            <strong>Verb tables & custom drill</strong>
            <span className="muted small">Look up any verb, drill chosen tenses</span>
          </a>
        </div>
      </section>

      <footer>
        <button
          className="link danger"
          onClick={() => {
            if (confirm('Reset all progress? (Your writing notes are kept.)')) {
              resetProgress();
              force((n) => n + 1);
            }
          }}
        >
          Reset progress
        </button>
      </footer>
    </div>
  );
}
