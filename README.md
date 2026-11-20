# Español A2 · Práctica

A personal practice platform for the UPV Español II (A2) course, Sept–Dec 2026.
It's mostly exercises and self-testing, with short theory notes and examples based on *Español A2 Práctico* and its answer key.

## Run

```bash
npm install
npm run dev      # open the printed URL (http://localhost:5173)
npm test         # engine + content checks
npm run build    # production build in dist/
```

Progress is stored in the browser (localStorage), and there is no server.

## What's inside

- **Topics** (★★★ = on the tests): indefinido, imperfecto, perfecto, both contrasts of the pasados,
  object pronouns, prepositions, ser/estar/hay, plus revision (present irregulars, gerundio, gustar,
  connectors, possessives/comparatives, gender/number, interrogatives). Each topic has a theory card and practice rounds.
- **Practice**: fill-the-gap sentences and stories, multiple choice, generated conjugation drills.
  Mistakes come back later (Leitner boxes); "Review mistakes" collects them across all topics.
- **Test simulations**: Test de verbos (20 min, 3 pasados) and Examen final (5 parts, scored /4).
- **Writing practice**: random past-tense topics, a 45-min timer, a word count, a tense counter,
  missing-accent hints and a checklist.
- **Every form of every verb**: each verb used on the platform is drilled in all persons and tenses,
  with whole-table exercises, an "all forms of X" drill after every exercise, and a coverage view
  on the Verbs page.

## Adding content

- Exercises live in `src/data/topics/*.ts`. Blanks are written as `[[answer|hint]]`, and
  several accepted answers as `[[fui/estuve|ir]]`.
- Verbs live in `src/data/verbs.ts` (irregularities are declared per verb).
- `npm test` checks every verb answer against the conjugator, so typos are caught.
