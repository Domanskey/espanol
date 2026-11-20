import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';

/** Render **bold** and *italic* inline markup */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : p.startsWith('*') && p.length > 2 ? (
          <em key={i}>{p.slice(1, -1)}</em>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

export function Stars({ n }: { n: number }) {
  return (
    <span className="stars" title={['', 'Revision', 'Important', 'Top priority'][n]}>
      {'★'.repeat(n)}
      <span className="stars-off">{'★'.repeat(3 - n)}</span>
    </span>
  );
}

export function Bar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const cls = pct >= 75 ? 'good' : pct >= 40 ? 'mid' : 'low';
  return (
    <div className="bar" title={`${pct}%`}>
      <div className={`bar-fill ${cls}`} style={{ width: `${Math.max(pct, 2)}%` }} />
    </div>
  );
}

const ACCENTS = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'];

/** Insert text into the focused input/textarea in a way React notices */
function insertIntoFocused(ch: string) {
  const el = document.activeElement;
  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) || el.readOnly) return;
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  const value = el.value.slice(0, start) + ch + el.value.slice(end);
  const proto = el instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.setSelectionRange(start + ch.length, start + ch.length);
}

export function AccentBar() {
  return (
    <div className="accent-bar" aria-label="Special characters">
      {ACCENTS.map((c) => (
        <button
          key={c}
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => {
            e.preventDefault(); // keep focus in the input
            insertIntoFocused(c);
          }}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

/** Countdown timer. Returns remaining seconds; calls onEnd once at 0. */
export function useCountdown(seconds: number, running: boolean, onEnd?: () => void) {
  const [left, setLeft] = useState(seconds);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;
  useEffect(() => setLeft(seconds), [seconds]);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          clearInterval(t);
          endRef.current?.();
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);
  return [left, setLeft] as const;
}

export const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function TimerBadge({ left, total }: { left: number; total: number }) {
  const warn = left <= Math.min(120, total * 0.1);
  return <span className={`timer ${warn ? 'warn' : ''}`}>⏱ {fmtTime(left)}</span>;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function BackLink({ to = '#/', label = '← Dashboard' }: { to?: string; label?: string }) {
  return (
    <a className="back" href={to}>
      {label}
    </a>
  );
}
