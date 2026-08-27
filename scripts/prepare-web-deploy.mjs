/**
 * Post-processes `dist/` after `expo export --platform web`, so the export can
 * be served by Vercel.
 *
 * One job: Expo emits the vector-icon fonts under
 * `assets/node_modules/@expo/vector-icons/…`, and Vercel refuses to serve a
 * path containing a `node_modules` segment — so every Ionicon renders as an
 * empty box. The folder is renamed here and `vercel.json` rewrites the
 * bundle's hardcoded URLs back onto it, which is why this script and that
 * rewrite have to stay in step.
 *
 * It runs as part of the Vercel build (see `buildCommand` in vercel.json), so
 * a `git push` produces the same output as a local build. Two build paths that
 * can disagree is the bug this whole arrangement exists to prevent: a working
 * CLI deploy was silently replaced by a broken Git one.
 */
import { existsSync, renameSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');
const from = join(dist, 'assets', 'node_modules');
const to = join(dist, 'assets', 'nm');

if (!existsSync(dist)) {
  console.error('prepare-web-deploy: no dist/ — run `expo export --platform web` first.');
  process.exit(1);
}

if (existsSync(from)) {
  renameSync(from, to);
  console.log('prepare-web-deploy: assets/node_modules -> assets/nm');
} else if (existsSync(to)) {
  console.log('prepare-web-deploy: assets/nm already in place');
} else {
  // Not fatal, but worth saying out loud: if Expo stops emitting this folder
  // the rewrite in vercel.json becomes dead weight rather than load-bearing.
  console.warn('prepare-web-deploy: no assets/node_modules found — check the icon fonts still serve.');
}
