import { useEffect, useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { TopicPage } from './pages/TopicPage';
import { TestPage } from './pages/TestPage';
import { WritingPage } from './pages/WritingPage';
import { VerbsPage } from './pages/VerbsPage';
import { Practice } from './components/Practice';
import { BackLink } from './components/common';
import { buildPractice, buildReview, topicById, verbSession } from './engine/session';

function useHash() {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const h = () => {
      setHash(location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  return hash;
}

export function App() {
  const hash = useHash();
  const [route, arg] = hash.replace(/^#\/?/, '').split('/');

  let page;
  switch (route) {
    case 'topic': {
      const t = topicById(arg);
      page = t ? <TopicPage topic={t} /> : <NotFound />;
      break;
    }
    case 'practice': {
      const t = topicById(arg);
      page = t ? (
        <>
          <BackLink to={`#/topic/${t.id}`} label={`← ${t.title}`} />
          <Practice key={hash} title={t.title} exercises={buildPractice(t)} onNewRound={() => buildPractice(t)} exitHref={`#/topic/${t.id}`} />
        </>
      ) : (
        <NotFound />
      );
      break;
    }
    case 'verb': {
      const inf = decodeURIComponent(arg ?? '');
      page = (
        <>
          <BackLink to="#/verbs" label="← Verbs" />
          <Practice key={hash} title={`All forms: ${inf}`} exercises={verbSession(inf)} onNewRound={() => verbSession(inf)} exitHref="#/verbs" />
        </>
      );
      break;
    }
    case 'review':
      page = (
        <>
          <BackLink />
          <Practice key={hash} title="Review mistakes" exercises={buildReview()} onNewRound={() => buildReview()} />
        </>
      );
      break;
    case 'test':
      page = arg === 'verbos' || arg === 'final' ? <TestPage key={arg} kind={arg} /> : <NotFound />;
      break;
    case 'writing':
      page = <WritingPage />;
      break;
    case 'verbs':
      page = <VerbsPage />;
      break;
    default:
      page = <Dashboard />;
  }
  return <main className="container">{page}</main>;
}

function NotFound() {
  return (
    <div className="card">
      <p>Page not found.</p>
      <BackLink />
    </div>
  );
}
