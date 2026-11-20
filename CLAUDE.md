# Español A2 · Práctica

A personal study platform for one student taking **Español II (A2) at UPV, Valencia (10 Sep – 22 Dec 2026)**.
The goal is **practice and self-testing first**, with short and simple theory. Focus on what is graded.
The user will bring more scanned textbook and handbook pages over time, to be turned into theory and exercises.

## Course facts (from the curriculum files in the repo root)

| Assessment | Pts | Date | Format |
|---|---|---|---|
| Examen final de gramática | 4 | 17 Dec | Fill the gaps, 45–75 min (the sources differ; the sim uses 60) |
| Texto escrito | 2 | 17 Dec | 12–15 lines in the past tense, topic unknown beforehand, 45 min, no translator |
| Test de verbos | 1 | ~24–26 Nov (depends on class progress) | 3 fill-the-gap exercises, the 3 past tenses, 20 min |
| Presentación oral | 2 | by 22 Dec | 3 min about a trip, indefinido + 4–5 imperfecto descriptions, no verbs on slides, no paper |
| Observación | 1 | — | attendance + homework text |

**Final exam contents:** indefinido vs imperfecto · indefinido vs perfecto · preposiciones (a, de, en, para, por…) · objeto directo (lo, la…) + indirecto (me, te, le…) · hay / es / está.
Full course syllabus: the 3 pasados and their contrasts, ser/estar/hay (present + past), gerundio (estaba + -ndo), present irregular review, prepositions, OD/OI, plus revision of comparatives, possessives/demonstratives and connectors.

Source files: `2026 PROGRAMACION 1A2 SEP*.pptx` (grading/syllabus), `2026 A2 SEP - CALENDARIO DE CLASES*.docx` (plan for each class), `2026 1A2 Calendario de PRESENTACIONES y EXÁMENES*.doc` (exam dates and contents), `Libro 1.pdf` / `Libro 2.pdf` (book *Español A2 Práctico*, "Cuadros gramaticales" pp. 42–51: Unidad 1 tables + Unidad 2 present irregular, gustar, gerundio, pasados, contraste de pasados).

## Decisions made with the user
- Explanations and UI are in **English**, exercises are in Spanish.
- Local **Vite + React + TypeScript** web app, no backend, progress in `localStorage`.
- **No AI checking** for now. Writing practice uses heuristics and a self-check list.
- Use the **book's terminology**: "Pretérito indefinido (perfecto simple)", "Pretérito imperfecto", "Pretérito perfecto (compuesto)". Spanish from Spain: **include vosotros**.
- Missing accents are shown separately ("accent" verdict) but **count as wrong**, both in mastery and in test scores.

## Commands
```bash
npm run dev     # dev server
npm test        # vitest: engine, content validation, page render smoke tests
npm run build   # tsc type-check + vite build
```
Always run `npm test` and `npm run build` after changing content or code. Commit only when the user asks.

## Structure
```
src/
  types.ts                  Topic, ItemDef, Block (theory), Exercise, Verdict
  data/verbs.ts             VERBS list + conjugator (presente, indefinido, imperfecto, perfecto, gerundio)
  data/topics/*.ts          one Topic per file (repaso.ts holds the ★ revision topics); index.ts = TOPICS in priority order
  engine/check.ts           answer normalisation, accent handling, [[blank]] parsing
  engine/progress.ts        localStorage store: Leitner boxes per exercise id, answers per day, notes
  engine/session.ts         builds practice / review / test sessions, mastery, grading
  components/               Practice (one-at-a-time runner), ExerciseView, Theory, common (AccentBar, timer, Bar…)
  pages/                    Dashboard (exam dates in DATES), TopicPage, TestPage, WritingPage, PresentationPage, VerbsPage
tools/pdf_pages.py          extract page images from scanned PDFs
```
Routing is by hash: `#/topic/<id>`, `#/practice/<id>`, `#/review`, `#/test/verbos|final`, `#/writing`, `#/presentation`, `#/verbs`.

## Adding new material (the usual task)

1. **Read the scans.** The PDFs are phone scans with no text layer, and `pdftoppm` isn't installed. Run
   `python3 -I tools/pdf_pages.py "<file>.pdf" <scratchpad>/pages` and then Read the JPGs. Images can be read directly too.
2. **Decide where it goes.** Add to an existing topic if it fits. Otherwise create `src/data/topics/<id>.ts` and register it in `index.ts`. Keep the priority order: tested content first. Set `stars` (3 = on the tests, 2 = important, 1 = revision) and `exam: ['verbos' | 'final']` if it applies.
3. **Theory = short.** Use `Block`s (`p`, `h`, `list`, `table`, `tip`, `conj`), with `**bold**` and `*italic*` markup. Give the rule, a table, 3–5 examples and the trigger words. It should take about 2 minutes to read. Mirror the book's explanations and example themes (Jorge, Valencia, trips to Praga/Viena/Roma/Teruel, biographies like Jorge Juan, Sara García Alonso).
4. **Exercises = most of the work.** Aim for ≥25 items per ★★★/★★ topic, and include 1–3 multi-gap stories.
   - `fill`: `'Ayer [[fui|ir]] al cine.'`. The hint after `|` is shown in brackets. Alternatives: `[[así que/por eso]]`. Put a subject in the text when the person is ambiguous: `(yo)`, `(nosotros)`.
   - **Reflexive pronouns go inside the blank:** `[[me levanté|levantarse]]`, not `me [[levanté|levantarse]]`.
   - `choice`: `{ t: 'choice', text: 'Gracias ___ tu ayuda.', options: ['por','para'], answer: 'por', why }`.
   - Add a short `why` to anything that tests a rule, such as a contrast, a preposition or a spelling change.
   - Sentences must have **one clearly correct answer**, so make the context words force the tense.
   - The exercise id is a hash of the topic + text. Editing an item's text resets its progress, which is fine.
5. **Verbs.** If an exercise uses a verb that isn't in `VERBS`, add it there and declare its irregularities: `pres: {change|yo|full}`, `pret: {strong|change|full}`, `imp`, `part`, `ger`. Then the content test validates its answers too.
6. **Tests.** `src/data/content.test.ts` checks that every verb blank in the tense topics matches the conjugator (`TENSES` map), and that there are no duplicates or malformed items. Add new tense-based topics to `TENSES`. Test sections need ≥3 fill items (see `buildTest` / `pickFill` in `session.ts`).

## Gotchas
- `progress.ts` uses **local dates** (not UTC) for daily counts and the streak.
- The practice Enter key: the first Enter checks the answer, and a window listener (attached on the next tick) handles "next". Don't also handle "next" in the input's onKeyDown, or one press will skip twice.
- `pickFill` allows at most one story per test section, and only if it is ≤60% of the gaps, so long stories appear in practice only.
- The verb test date in `pages/Dashboard.tsx` `DATES` is provisional. Update it when the user confirms.
