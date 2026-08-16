# Unolingo

A Spanish-learning app built for one learner, teaching **Peninsular Spanish (es-ES)**.

Duolingo is fun but repetitive, and better at teaching isolated words than Spanish.
A textbook teaches better but is boring enough to abandon. Unolingo is an attempt at the
overlap: engaging enough to open daily, built around how people actually acquire a language.

Expo + React Native + TypeScript. Runs on iOS, Android and web. Offline, no account, no server.

---

## What it does

**Adaptive placement.** A twelve-question test that follows you up or down the CEFR levels
after each answer, so if you already know the basics you reach B1 material in four questions
instead of grinding through "hola". It estimates a level, names your weak areas, and seeds
the learner model — concepts you failed start shaky and due for review immediately.

**A real spaced-repetition model.** Every concept — a word, a grammar rule, a verb paradigm —
carries a memory record: strength, stability, ease, depth, next review. `stability` is the
number of days until predicted recall decays to the review threshold, which gives a
continuous "how likely am I to still know this" score. That curve ranks Smart Review and
spots concepts about to be lost, which a fixed interval ladder cannot.

**Progressive production.** A concept appears first as recognition, then reconstruction,
then free production. The generator reads each concept's strength and returns the shallowest
exercise that is still challenging, so you spend your time just past what you can already do.

**Exercise variety by construction.** One well-written sentence yields a translation, a word
bank, a gap fill, a dictation, a listening item and a grammar challenge. The session builder
interleaves so that no two adjacent exercises share a type — a ten-minute session genuinely
feels varied.

**Grammar that explains.** Concise cards built from a structured block format (rules,
contrasts, tables, examples, pitfalls) with an "Explain more" layer for depth on demand.

**Mistakes as data.** Every wrong answer is recorded with what you wrote, what was better and
why. Repeated confusions are grouped into patterns with a one-tap targeted drill.

**No hearts, no energy, no limits.** A wrong answer shortens a review interval. It never
stops you learning. Streaks are recomputed rather than punished.

Also: conversation scenes that de-guide as you improve, interactive stories, a searchable
personal dictionary annotated with your own mastery, full verb conjugations with irregular
forms highlighted, culture notes, XP that reflects effort and cannot be farmed, achievements,
and analytics that answer questions a learner would actually ask.

---

## Architecture

Three layers, deliberately kept apart:

```
src/content/     data only — no React, no logic
  types.ts       the content model
  index.ts       registry + lookups + validateContent()
  vocab/         ~255 vocabulary and phrase concepts
  sentences/     ~180 natural, tagged example sentences
  grammar/       ~19 grammar concepts with deep-dive layers
  verbs.ts       30 verbs; regular forms generated, irregulars authored
  curriculum.ts  4 stages → 10 units → 43 lessons
  conversations.ts, stories.ts, culture.ts, drills.ts, placement.ts

src/learning/    pure logic — no React, fully unit-tested
  srs.ts         spaced repetition and mastery
  mastery.ts     aggregation, weak areas, CEFR estimate
  answer-check.ts smart answer validation
  generator.ts   concept + learner state → exercise
  session.ts     session assembly, ordering, interleaving
  placement.ts, xp.ts, check.ts, achievements.ts

src/app/         Expo Router screens
src/components/  ui primitives, exercise renderers, learn components
src/context/     the persisted learner store
```

**Lessons never contain exercises.** A lesson declares what it teaches and which sentences
it may draw on; the generator builds the exercises from that plus your current state. The
same lesson is gentler the first time and harder later.

### Adding content

1. Add words to `src/content/vocab/`, sentences to `src/content/sentences/` (tagged with the
   concepts they exercise).
2. Add a lesson to a unit in `src/content/curriculum.ts`.
3. `npm test` — `validateContent()` names anything that does not resolve.

Nothing else changes. That is the point of the architecture.

---

## Answer checking

Language does not have one right answer, and phone keyboards make accents a chore, so the
checker works in layers:

1. exact match against any accepted answer (case and punctuation ignored);
2. match with accents stripped — accepted, with a note naming the accents, because
   "como estas" plainly shows you understood (strict mode is a setting);
3. match within a small edit distance — graded "almost", so one typo does not wipe out a
   concept's memory record;
4. otherwise wrong, with the model answer and an explanation.

Spanish drops subject pronouns, so "Voy a comer ahora" and "Yo voy a comer ahora" are both
accepted — but only when the pronoun agrees with the verb. "Tú tengo un perro" is rejected,
because silently accepting a person error teaches the wrong thing.

---

## Audio

`expo-speech` with an `es-ES` voice, preferring a Castilian one where the device has it.
Offline, free, instant for new content, available on all three platforms. Normal and slow
playback; slow is always available but never the default. `src/lib/speech.ts` is the single
seam where recorded native-speaker audio would drop in.

Speaking exercises play a model, ask you to repeat, and let you self-assess — pronunciation
*scoring* needs on-device recognition, so rather than fake a score the architecture leaves a
clean slot for it.

---

## Commands

```bash
npx expo start                   # dev server; press i / a / w
npm test                         # 77 tests — learning logic + content integrity
npx tsc --noEmit                 # type-check
npx expo export --platform web   # bundles and statically renders every route
```

---

## State of the course

43 lessons across four stages (A0 → B2): Foundations, Everyday Spanish, Independent Spanish,
Conversational Fluency. ~255 vocabulary items, ~180 sentences, 19 grammar concepts, 30
verbs, 4 conversation scenes, 2 stories, 12 culture notes, 22 error drills, 12 naturalness
drills, 28 placement questions.

Enough to use for real, and structured so it can grow to ten times that without the codebase
noticing.
