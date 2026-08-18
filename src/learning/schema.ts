/**
 * The version stamped on every saved learner record.
 *
 * It lives alone in its own file because both the React store and the pure
 * learning layer need it, and the learning layer must not import the store.
 * Bumping it means every existing record has to be carried forward by a step in
 * `migrate.ts` — there is no path that silently discards one.
 */
export const STATE_VERSION = 1;
