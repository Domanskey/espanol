import type { Block, Tense } from '../types';
import { conjugate, PERSONS, TENSE_LABEL } from '../data/verbs';
import { Rich } from './common';

export function Theory({ blocks }: { blocks: Block[] }) {
  return (
    <div className="theory">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'p':
            return (
              <p key={i}>
                <Rich text={b.text} />
              </p>
            );
          case 'h':
            return <h3 key={i}>{b.text}</h3>;
          case 'tip':
            return (
              <div key={i} className="tip">
                💡 <Rich text={b.text} />
              </div>
            );
          case 'list':
            return (
              <ul key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>
                    <Rich text={it} />
                  </li>
                ))}
              </ul>
            );
          case 'table':
            return (
              <div key={i} className="table-wrap">
                <table>
                  {b.head && (
                    <thead>
                      <tr>
                        {b.head.map((h, j) => (
                          <th key={j}>
                            <Rich text={h} />
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j}>
                        {r.map((c, k) => (
                          <td key={k}>
                            <Rich text={c} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'conj':
            return <ConjTable key={i} tense={b.tense} verbs={b.verbs} />;
        }
      })}
    </div>
  );
}

export function ConjTable({ tense, verbs }: { tense: Tense; verbs: string[] }) {
  return (
    <div className="table-wrap">
      <table className="conj">
        <thead>
          <tr>
            <th>{TENSE_LABEL[tense]}</th>
            {verbs.map((v) => (
              <th key={v}>{v}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERSONS.map((p, i) => (
            <tr key={p}>
              <td className="muted">{p}</td>
              {verbs.map((v) => (
                <td key={v}>{conjugate(v, tense, i)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
