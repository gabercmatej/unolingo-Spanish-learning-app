# CLAUDE.md

@AGENTS.md

Unolingo: Expo + React Native Spanish-learning app for iOS/Android/web. Expo 57, RN 0.86, React 19, strict TypeScript.

**Language:** Peninsular Spanish (`es-ES`) is the default product: vosotros, coger, móvil, ordenador, vale. Latin-American forms only as labelled 🇪🇸/🌎 comparisons.

## Commands

```bash
npm test
npm run typecheck
npm run lint
npm run audit:content
npx expo export --platform web
```

`test`, `typecheck`, and `lint` must pass. `audit:content` is a content definition-of-done diagnostic and may fail while gaps remain; fix content, never weaken the audit. Run web export for routing/module-graph/cross-platform changes.

## Architecture

Keep boundaries strict:

- `src/content/`: data only. No React/learning logic. Register new files in `content/index.ts`.
- `src/learning/`: pure learning logic. No React/platform APIs.
- `src/app/`, `src/components/`: UI only; render learning-layer output, do not compute mastery/select exercises/grade.
- `src/lib/`: platform seams only (`speech`, storage, snapshots, files, haptics, navigation, date). No product policy.
- `LearnerContext.tsx`: only persisted learner state.

`STATE_VERSION` changes can invalidate progress. Bump only with migration/deliberate reset. Optional settings merge with defaults and need no bump.

## Curriculum rules

Hierarchy: **Stage → Unit → Lesson → Exercise**.

- Lessons declare content; `session.ts` generates exercises. Never store exercises in lessons.
- Checkpoints draw across their whole stage.
- Completion ≠ mastery.
- CEFR placement is pedagogical; moving units is allowed.
- Core lessons form one linear required prerequisite chain.
- Optional lessons may depend on required lessons but never block later required lessons or become part of the required carry.
- After moving curriculum, re-link prerequisites.

A lesson cannot teach more concepts than its session can surface. Session target is `clamp(estMinutes * 1.8, 10, 20)`; increase time or split the lesson instead of silently dropping concepts.

## Concepts and verbs

Concepts are the unit of memory. Untaught/unreachable concepts are dead content.

Verb concepts are derived as `f.<verb>.<tense>`, but derivation does **not** make them reachable: assign intended paradigms to lessons.

`verb-corpus.ts` detects conjugated forms from sentence text. Do not manually tag sentences with verb-form concepts.

Verb rules:

- irregular future ⇄ conditional: define both;
- multi-word forms match token sequences;
- compound exercises blank the auxiliary; reflexives blank the conjugated verb;
- guard ambiguous forms/homographs/syncretism;
- add ambiguity regressions to `verb-corpus.test.ts`;
- protect `vosotros` coverage.

## Learning invariants

- One grading path: `checkExercise()`.
- One session player: `src/app/session.tsx`.
- `stability` = days until review threshold; Smart Review ranks by `retrievability()`.
- Wrong answers shorten review intervals + record mistakes; never block learning.
- No hearts, energy, daily caps, or punitive streak mechanics.
- Rank = progression distance; CEFR = demonstrated ability. Never conflate them.
- `curriculumLevel()` and `estimateProficiency()` may disagree.
- CEFR requires coverage plus listening/production evidence; `A2+`-style held-back states are valid.
- English checking is meaning-based; Spanish is stricter.
- Subject pronouns must agree with the verb.
- Negation/polarity must match.

## Exercise selection

- At demonstrated B2+, demote plain recognition (`multipleChoice`, `match`); do not remove it.
- Keep discriminating recognition (`chooseNatural`, `grammarChoice`, `listenSelect`) first-class.
- Apply B2+ demotion after freshness ordering.
- `skillBalance()` changes difficulty within a skill; it does not remove skills.
- Checkpoints enforce per-skill floors.
- Listening/production belong to the generator, not only dedicated lesson types.
- `correctMistake` and `chooseNatural` are hand-authored in `content/drills.ts`; every level needs both.

## Library and backups

Library grammar/verbs use teaching order (`byTeachingOrder`, `byVerbTeachingOrder`), not alphabetical order.

Backup policy belongs in `learning/backup.ts`; storage plumbing belongs in `lib/`.

- 3 rolling snapshots;
- snapshot before destructive actions;
- empty state must never displace a full backup;
- restore validates format/version/data;
- settings stay local.

## Cross-platform/UI traps

- Never use `Alert.alert` for web confirmation; use `useConfirm()`.
- Prefer project UI abstractions over native controls with inconsistent theming.
- Never nest pressables (invalid nested buttons on web).
- Long flex text often needs `minWidth: 0`.
- Dark-mode elevation cannot rely on shadow alone.
- `BottomTabInset` must match tab-bar height.
- Never call `Date.now()` during render; use `useNow()`.
- Use RN primitives + `Platform.select`; cross-platform is mandatory.
- Install Expo packages with `npx expo install`.
- Design tokens live in `constants/theme.ts`; do not hardcode visual tokens.
- Prefer `PressScale` to raw `Pressable`.
- Respect `ReduceMotion.System`.
- Use `<Text numeric>` for changing numbers.
- UI icons use the shared Ionicons vocabulary, not emoji.
- Audio goes through `lib/speech.ts`.

## IDs

`v.` vocab · `p.` chunk · `g.` grammar · `f.<verb>.<tense>` verb · `s.` sentence · `l.` lesson · `unit.` · `stage.`

Sentence prefixes are file-based: `s.f` foundations, `s.k` A1, `s.m` A2, `s.b` B1, `s.c` B2, `s.d` C1, `s.e` everyday/C2, `s.r` routine, `s.s` social, `s.a` around-Spain. `s.e` overlaps intentionally; uniqueness tests catch collisions.

## Add content

1. Add concepts/vocab/sentences under `src/content/`.
2. Add/update curriculum lesson (`teaches`, `sentences`, `requires`, `optional`).
3. Register new files in `content/index.ts`.
4. Run `npm test` + `npm run audit:content`.

Ordinary content additions should not require UI/generator changes.

### Add a verb

1. Add to `verbs.ts`; author irregulars only.
2. Pair irregular future + conditional.
3. Add `v.<verb>` if needed.
4. Assign paradigms to lessons.
5. Add sentences containing the forms; do not verb-tag them manually.
6. Run tests + audit and check reachability/support.

## Testing discipline

For generator, curriculum, mastery, or conjugation changes, run the full suite.

Important coverage:

- `content.test.ts`: ids/reachability/prerequisites
- `session.test.ts`: assembly/checkpoints/mix
- `srs.test.ts`: review model
- `answer-check.test.ts`: grading
- `cefr.test.ts`: CEFR gates
- `backup.test.ts`: restore/snapshots
- `verb-corpus.test.ts`: matching ambiguity
- `verb-flow.test.ts`, `journey.test.ts`: end-to-end composition
- `audit.test.ts`: content DoD, intentionally outside `npm test`

Prefer end-to-end regression tests for new subsystems. A regression test should fail without its fix.

## Current constraints

- Speaking uses self-report; no pronunciation scoring yet.
- `npm run audit:content` is the source of truth for changing coverage/depth metrics. Do not copy live audit numbers here.
- Audit NOTES are prioritization signals, not quotas.
