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
| Presentación oral | 2 | by 22 Dec | 3 min about a trip (not practised on the platform: the user asked to remove presentation prep) |
| Observación | 1 | — | attendance + homework text |

**Final exam contents:** indefinido vs imperfecto · indefinido vs perfecto · preposiciones (a, de, en, para, por…) · objeto directo (lo, la…) + indirecto (me, te, le…) · hay / es / está.
Full course syllabus: the 3 pasados and their contrasts, ser/estar/hay (present + past), gerundio (estaba + -ndo), present irregular review, prepositions, OD/OI, plus revision of comparatives, possessives/demonstratives and connectors.

Source files: `2026 PROGRAMACION 1A2 SEP*.pptx` (grading/syllabus), `2026 A2 SEP - CALENDARIO DE CLASES*.docx` (plan for each class), `2026 1A2 Calendario de PRESENTACIONES y EXÁMENES*.doc` (exam dates and contents), `Libro 1.pdf` / `Libro 2.pdf` (book *Español A2 Práctico*, "Cuadros gramaticales" pp. 42–51: Unidad 1 tables + Unidad 2 present irregular, gustar, gerundio, pasados, contraste de pasados), `Libro soluciones.pdf` (the book's answer key, pp. 52–62, Unidades 0–6). The answer key's comprehension answers were reused as exercise sentences about the book's characters (Jorge Juan, Cecilia, Jaime, Lupe, Verónica, Julie; trips to Heidelberg/Praga/Viena/Salamanca/Roma/Teruel/Toulouse; biographies of Hedy Lamarr, Sara García Alonso, Einstein, Don Quijote). Comprehension questions about texts we don't have were skipped.

## Decisions made with the user
- Explanations and UI are in **English**, exercises are in Spanish.
- Local **Vite + React + TypeScript** web app, no backend, progress in `localStorage`.
- **No AI checking** for now. Writing practice uses heuristics and a self-check list.
- Use the **book's terminology**: "Pretérito indefinido (perfecto simple)", "Pretérito imperfecto", "Pretérito perfecto (compuesto)". Spanish from Spain: **include vosotros**.
- Missing accents are shown separately ("accent" verdict) but **count as wrong**, both in mastery and in test scores.
- **EVERY FORM OF EVERY VERB (key user requirement).** Any verb used anywhere on the platform (now or in future content) must be testable in **all 6 persons × all 5 tenses**. In practice:
  - Every verb in an exercise hint **must be in `VERBS`** (`content.test.ts` enforces this; `haber` is the only exception).
  - `conjVerbs()` drills **all** `DRILL_VERBS` (not only irregular ones) in every tense topic.
  - Tense-topic practice rounds include 3 **whole-table** exercises (`kind: 'table'`, all persons at once).
  - After any exercise, the feedback links to **"all forms of X"** (`#/verb/<inf>`: full tables in all 5 tenses).
  - Verbs page: coverage colours per form, single/table drill modes, and an "only forms I haven't mastered" filter.
  - Use varied persons in new sentences (tú, nosotros, vosotros, ellos too), not just yo/él.
- gustar-type verbs (gustar, encantar, doler, molestar, interesar) and llover are `impersonal: true`: excluded from yo/tú drills. gustar-type verbs are practised in all persons via me/te/le/nos/os/les in the gustar topic.
- Presentation prep was **removed** at the user's request. Don't re-add it.

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
  data/verbs.ts             VERBS list + conjugator (presente, indefinido, imperfecto, perfecto, gerundio), DRILL_VERBS, acceptedForms
  data/topics/*.ts          one Topic per file (repaso.ts holds the ★ revision topics); index.ts = TOPICS in priority order
  engine/check.ts           answer normalisation, accent handling, [[blank]] parsing
  engine/progress.ts        localStorage store: Leitner boxes per exercise id, answers per day, notes
  engine/session.ts         builds practice / review / test sessions, table + verb sessions, mastery, grading, recordResult
  components/               Practice (one-at-a-time runner), ExerciseView, Theory, common (AccentBar, timer, Bar…)
  pages/                    Dashboard (exam dates in DATES), TopicPage, TestPage, WritingPage, VerbsPage
tools/pdf_pages.py          extract page images from scanned PDFs
```
Routing is by hash: `#/topic/<id>`, `#/practice/<id>`, `#/review`, `#/verb/<inf>` (all forms of one verb), `#/test/verbos|final`, `#/writing`, `#/verbs`.

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
5. **Verbs (mandatory).** Every verb used in a hint must be in `VERBS`, so the user is drilled in all its forms. Declare its irregularities: `pres: {change|yo|full}`, `pret: {strong|change|full}`, `imp`, `part`, `ger` (`full` arrays contain **no** reflexive pronoun: the conjugator adds it). Add conjugation cases for tricky new verbs to `engine.test.ts`, and check the verb's table on the Verbs page.
6. **Tests.** `src/data/content.test.ts` checks that every verb blank in the tense topics matches the conjugator (`TENSES` map), and that there are no duplicates or malformed items. Add new tense-based topics to `TENSES`. Test sections need ≥3 fill items (see `buildTest` / `pickFill` in `session.ts`).

## Gotchas
- `progress.ts` uses **local dates** (not UTC) for daily counts and the streak.
- The practice Enter key: the first Enter checks the answer, and a window listener (attached on the next tick) handles "next". Don't also handle "next" in the input's onKeyDown, or one press will skip twice.
- Progress: a `table` result is also recorded per cell as `c:<tense>:<verb>:<person>` (`recordResult`), so coverage and single-form drills share stats.
- `pickFill` allows at most one story per test section, and only if it is ≤60% of the gaps, so long stories appear in practice only.
- The verb test date in `pages/Dashboard.tsx` `DATES` is provisional. Update it when the user confirms.
