import type { Topic } from '../types';
import { conjExercises, itemExercises, mastery } from '../engine/session';
import { BackLink, Bar, Stars } from '../components/common';
import { Theory } from '../components/Theory';

export function TopicPage({ topic }: { topic: Topic }) {
  const m = mastery(topic);
  const nItems = itemExercises(topic).length;
  const nConj = conjExercises(topic).length;
  return (
    <div className="topic-page">
      <BackLink />
      <header className="topic-header">
        <div>
          <Stars n={topic.stars} />
          <h1>{topic.title}</h1>
          <p className="muted">{topic.subtitle}</p>
        </div>
        <div className="topic-actions">
          <a className="btn primary big" href={`#/practice/${topic.id}`}>
            ▶ Practise (15)
          </a>
          <div className="mastery">
            <span className="muted small">Mastery {Math.round(m * 100)}%</span>
            <Bar value={m} />
          </div>
          <span className="muted small">
            {nItems} exercises{nConj ? ` + ${nConj} conjugation drills` : ''}
          </span>
        </div>
      </header>
      <div className="card">
        <Theory blocks={topic.theory} />
      </div>
      <div className="row center">
        <a className="btn primary big" href={`#/practice/${topic.id}`}>
          ▶ Practise now
        </a>
      </div>
    </div>
  );
}
