# Progression, curriculum depth and revision — design

**Date:** 2026-08-26
**Branch:** `curriculum-and-progression-pass`

One coherent upgrade pass. It does three things that turn out to be one thing:
it separates *progression* from *mastery* in the data model, it lets the learner
prove intent by finishing something ahead, and it fills the curriculum out until
each CEFR stage can credibly claim its level.

Everything below reuses the existing three-layer split (`content/` data,
`learning/` pure logic, `app/` + `components/` UI). No architecture is replaced.

---

## 1. The core problem

A unit currently carries three overlapping state machines:

| Machine | Values | Driven by |
|---|---|---|
| `UnitState` | `planned` `locked` `available` `current` `complete` | required lessons |
| `UnitPhase` | `learning` `practising` `strengthening` `maintaining` | mastery + arc |
| `UnitArc` | `mixed` `recall` `consolidate` | generated, stored as pseudo-lessons |

The Learn page then renders **the arc's counter as the unit's progress**
(`journey.tsx`, `UnitMeta`), so a unit with every lesson ticked reads `2/5` with
"Next: Active recall" underneath. That is the reported "completed but not
mastered" confusion, and it is a presentation of two different questions through
one number.

The fix is not to delete the arc. The arc is the repetition engine this pass
needs *more* of. The fix is to stop it counting as progression.

### The model, stated once

```
Section → Unit → required Lessons → Unit Completed
```

- **Lessons are progression.** Every lesson shown as part of a unit's spine is
  required. All of them done ⇒ unit Completed. Full stop.
- **Practice is optional mastery.** Mixed practice, active recall, consolidate,
  strengthen, Smart Review. Available *after* completion, unlimited, improves
  mastery, and **never** changes whether the unit is completed.

These two never share a counter, a progress bar, or a list.

`Locked → Available → In Progress → Completed → Revision/Mastery`

---

## 2. `src/learning/progression.ts` (new, pure)

Single source of truth for where the learner is. No React, fully testable.

```ts
requiredLessons(): Lesson[]                 // allLessons minus optional, curriculum order
continueTarget(learner): Lesson | null      // first incomplete required lesson
lessonReach(lesson, learner): LessonReach   // 'done' | 'next' | 'ahead'
unitReach(unit, learner): UnitReach
skipForwardPatch(learner, lessonId, now): SkipPatch
```

**Why `continueTarget` is a one-line lookup.** Skip-forward back-fills every gap
behind a completed lesson, and placement already completes a prefix of the
course. So the set of completed required lessons is *always a contiguous
prefix*. "Furthest fully completed" and "first incomplete" are therefore the
same boundary, and Continue needs no session history, no recency, no scan.

This invariant is load-bearing and gets its own regression test.

---

## 3. Skip-forward

**Rule:** successfully completing required lesson at index `X` auto-completes
every unfinished **required** lesson before `X`. Nothing else, ever.

| Action | Effect |
|---|---|
| Open a future unit | nothing |
| Open a future lesson | nothing |
| Start a future lesson, quit | nothing |
| Background/kill mid-lesson | nothing (see §4) |
| **Successfully complete a future lesson** | back-fill everything required before it |

Never auto-completes: optional lessons, practice/arc sessions, or anything
*after* the reached lesson.

### Where it lives

`finishSession` in `LearnerContext.tsx` is the only place a lesson is ever
marked complete. The policy is pure and lives in `progression.ts`; the context
applies the patch. That is the same split that moved snapshot rules out of
`lib/snapshots.ts`.

### What a skipped lesson writes

```ts
completedLessons[id] = { at: now, accuracy: 0, times: 0, skipped: true }
```

`skipped` is an optional field on an existing nested object, so **no
`STATE_VERSION` bump** — the `MistakeRecord` precedent. Consumers that average
accuracy must exclude skipped entries, or a skip would read as a lesson failed.

### Unlocking the knowledge, without inventing evidence

Every concept in a skipped lesson's `teaches` + `grammar` goes through
`introduce()` from `srs.ts`, which sets `introduced: true` and schedules
`dueAt`, and deliberately does **not** touch `timesSeen`, `strength`, `depth`
or `lastReviewed`.

This is exactly the **encountered vs retrieved** distinction the codebase
already enforces. It gives the learner everything a normally-completed unit
gives — Library entries, verb paradigms, grammar pages, expressions, eligibility
for production, a place in the review queue — while keeping the invariant that
*only evidence may move mastery*. A skip is a declaration of intent, not proof
of recall, and the mastery figure must keep saying so.

The results screen names any unit closed this way, so the skip is visible rather
than silent.

---

## 4. Three lesson states, never inferred

`in progress`, `abandoned` and `completed` are distinct. **Completion is never
inferred from answers submitted or XP earned.**

| Event | Marker | Continue |
|---|---|---|
| Press X / back / quit | cleared | first incomplete required lesson |
| Background, lock, app switch, process kill | kept | offers *Resume Lesson X* |
| Reach the real end of the session | cleared, lesson completed | advances |

`activeLesson?: { lessonId: string; at: number }` on `LearnerState` — optional,
so **no `STATE_VERSION` bump** (the `developerMode` shape). Resume restarts the
lesson from its first exercise; question-level restoration is explicitly out of
scope.

---

## 5. Soft locking

Future content is dimmed and clearly ahead of the recommended path, but
openable. `UnitState` keeps the name `locked`; its meaning becomes "ahead of
your path", and `isLessonUnlocked` stops gating navigation.

The course still *guides* order. It just stops *enforcing* it, because
completing something ahead is now the sanctioned way to say "I know this".

---

## 6. Unit model

`UnitProgress`:

- `state` — from required lessons only (logic unchanged)
- `lessonsDone` / `lessonCount` — required only; **the only progress figure shown**
- `mastery`, `needsReview` — revision-side, never gating
- `arc: UnitArc` → **`practice: UnitPractice`** — optional sessions, offered only
  once `state === 'complete'`, unordered, never counted in progress
- `phase` — retained, but only meaningful post-completion

`unit-arc.ts` keeps its generation engine and its `goalMet` escape hatch. What
it loses is the sequential `unlocked` chaining to lessons and the combined
`stepCount`/`stepsDone`. Existing `arc:<unit>:<phase>` keys in `completedLessons`
stay valid and become practice history — no migration.

---

## 7. Surfaces

**Learn page.** Each unit is a bounded rail group: header, a rail running down
its required lessons, and an explicit **end cap** where the unit closes before
the next begins. Optional lessons sit under a subtle "Extra" divider so they
never read as required. Completed units collapse to `Completed ✓ · Practice`.
Existing visual language (rail, node, connector, tone colours) is kept.

**Progress tab.** `WeeklyXp` → `DailyXp`: Monday→Sunday of the current week, one
bar per day, from `learner.daily` (already `{date, xp, seconds, exercises}` per
ISO day — no new tracking). Zero-XP days render a flat baseline tick with a
dimmed label rather than vanishing. Today is highlighted. The 17-week activity
calendar stays for the longer view.

**Library.** Grouping toggle **By section/unit ⇄ By level ⇄ A–Z**, plus filters
All · Learned · Recently learned · Not yet met alongside the existing
favourites / expressions / Spain-only. Grouping is derived through
`getLessonThatIntroduces` → `getUnitForLesson` → `getStageForUnit`. Applies to
Words, Verbs and Grammar. Existing `/search` is reused, not duplicated.

**Unit study sheet.** A completed unit shows Words · Verbs · Grammar ·
Expressions · Lessons · Practice, all derived from `getUnitTaughtConcepts` and
the registry. No duplicated content.

---

## 8. Sentence building

`wordBank` is promoted in `candidateKinds` so sentence construction becomes a
core format rather than an occasional one, across vocabulary, grammar, word
order, pronouns, conjugation, questions, negation, prepositions and expressions.
It joins the rotation lists so a fixed preference order cannot starve it — the
same device as `LISTENING_ROTATION`.

A new floor test mirrors the existing modality floor: a minimum share of
`wordBank` across generated lesson sessions, so a later change to
`candidateKinds` cannot quietly undo this.

The mix stays varied. This is a shift in weighting, not a monoculture.

---

## 9. Curriculum expansion

**Definition of done:** *could someone who genuinely mastered this stage function
at the claimed CEFR level?* Counts are audit metrics and warning signals, never
targets. No padding: every addition fills a real communicative or linguistic gap.

### Measured starting point

| Stage | Units | Required lessons | Concepts taught |
|---|---|---|---|
| A0→A1 | 14 | 28 | 301 |
| A1→A2 | 15 | 20 | 204 |
| A2→B1 | 15 | 18 | 162 |
| B1→B2 | 6 | 7 | 66 |
| B2→C1 | 7 | 9 | 57 |
| C1→C2 | 6 | 10 | 83 |

652 vocabulary concepts, 1680 sentences, 159 lessons, 63 units.

Known thin domains: weather (7 words), home (12), body parts (~8: cabeza,
estómago, garganta, espalda, mano, pie), directions (no arriba/abajo/detrás/
entre/dentro/fuera), clothes (6, inside shopping), transport (13, no
avión/aeropuerto/taxi/bici).

### Method

Per stage, audit against what a learner must understand and express at that
level, then author to close the gaps: vocabulary, chunks, verbs, grammar,
sentence patterns, and the practice contexts that make them reusable. Sentence
count follows from concept support — every important concept needs enough varied
contexts to be learnable and reusable, not one token example.

Later stages are expanded substantially so progression does not go shallow, with
difficulty shifting from recognition toward independent comprehension and
production.

### The audit gate

Existing `audit:content` stays **11/11 green with zero regressions** throughout.
Never weaken an assertion to make it pass; fix the content.

The audit is also **extended** to measure this pass's actual goal:

- practical-domain coverage by CEFR stage
- vocabulary and chunk breadth per stage
- core verb coverage
- grammar coverage
- domains that are clearly under-served
- later stages that are shallow relative to their claimed ability

These identify obvious gaps and suspiciously thin coverage. They do **not**
impose numeric quotas, because a quota is an instruction to pad. Following the
existing NOTE/WARNING split: WARNINGS are defects, NOTES are a standing
judgement queue that is not supposed to reach zero.

**Definition of done:** existing audit fully green **and** the new CEFR/domain
audit is credible **and** the curriculum passes both.

---

## 10. Migration and preservation

No `STATE_VERSION` bump. Three additions, all in shapes the codebase has already
established as version-free:

| Addition | Shape | Precedent |
|---|---|---|
| `completedLessons[id].skipped?` | optional nested field | `MistakeRecord.sentenceId` |
| `activeLesson?` | optional top-level field | `settings.developerMode` |
| arc keys → practice history | already `Record<string, …>` | `arc:<unit>:<phase>` |

Existing progress is preserved: a unit whose lessons are done was already
`complete` under the old rule and stays `complete` under the new one. Stage
counters do not move. Content drift is already guarded at every call site.

---

## 11. Edge cases under test

- completing lessons normally
- leaving a lesson early (abandoned ≠ complete, Continue unmoved)
- backgrounding mid-lesson (in progress, Resume offered)
- completing an entire unit
- revising a completed unit (mastery moves, completion does not)
- jumping ahead: completing a later lesson back-fills, and **only** backwards
- opening/starting-but-quitting future content changes nothing
- returning to an earlier unfinished unit
- Continue after a skip
- Library items unlocking on skip (introduced, but mastery not inflated)
- existing saved records migrating with no loss
- the contiguous-prefix invariant holding after every path above

---

## 12. Priority order

1. Correct progression/state logic
2. Curriculum depth and learning quality
3. Useful repetition
4. Sentence-building exercises
5. Unit revision and Library organisation
6. Visual polish
