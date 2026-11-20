const KEY = 'espanol.progress.v1';

export interface ItemStat {
  /** Leitner box 1..5 (1 = just got it wrong) */
  box: number;
  seen: number;
  correct: number;
  last: number;
}

interface Store {
  items: Record<string, ItemStat>;
  /** answers given per day, YYYY-MM-DD -> count */
  days: Record<string, number>;
  /** free text saved by the writing page */
  notes: Record<string, string>;
}

let cache: Store | null = null;

function load(): Store {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Store) : null;
  } catch {
    cache = null;
  }
  cache ??= { items: {}, days: {}, notes: {} };
  cache.items ??= {};
  cache.days ??= {};
  cache.notes ??= {};
  return cache;
}

function save() {
  if (cache) localStorage.setItem(KEY, JSON.stringify(cache));
}

const pad = (n: number) => String(n).padStart(2, '0');
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => dayKey(new Date());

export function getStat(id: string): ItemStat | undefined {
  return load().items[id];
}

/** countDay=false for derived records (e.g. each cell of a table) */
export function record(id: string, correct: boolean, countDay = true) {
  const s = load();
  const prev = s.items[id];
  const box = !prev ? (correct ? 3 : 1) : correct ? Math.min(5, prev.box + 1) : 1;
  s.items[id] = {
    box,
    seen: (prev?.seen ?? 0) + 1,
    correct: (prev?.correct ?? 0) + (correct ? 1 : 0),
    last: Date.now(),
  };
  if (countDay) {
    const d = today();
    s.days[d] = (s.days[d] ?? 0) + 1;
  }
  save();
}

/** 0..1 contribution of an item to mastery */
export function itemScore(id: string): number {
  const st = load().items[id];
  if (!st) return 0;
  return [0, 0, 0.4, 0.6, 0.8, 1][st.box];
}

const INTERVAL_DAYS = [0, 0, 1, 2, 4, 8];
export function isDue(id: string, now = Date.now()): boolean {
  const st = load().items[id];
  if (!st) return true;
  return now - st.last >= INTERVAL_DAYS[st.box] * 86_400_000;
}

export function allStats(): Record<string, ItemStat> {
  return load().items;
}

export function answersToday(): number {
  return load().days[today()] ?? 0;
}

/** consecutive days (ending today or yesterday) with at least one answer */
export function streak(): number {
  const days = load().days;
  let n = 0;
  const d = new Date();
  if (!days[today()]) d.setDate(d.getDate() - 1);
  while (days[dayKey(d)]) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function getNote(key: string): string {
  return load().notes[key] ?? '';
}

export function setNote(key: string, value: string) {
  load().notes[key] = value;
  save();
}

export function resetProgress() {
  cache = { items: {}, days: {}, notes: load().notes };
  save();
}
