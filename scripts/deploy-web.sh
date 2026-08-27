#!/usr/bin/env bash
#
# Deploy the web build to Vercel, and then check it actually serves.
#
# There is deliberately **one** build path: `vercel.json` carries the build
# command, the output directory and the rewrites, so a `git push` and this
# script produce the same site. That is not tidiness — an earlier arrangement
# had a local prebuilt deploy *and* a Git-triggered one with different
# settings, and every push silently replaced a working deploy with a 404.
#
# Usage:  bash scripts/deploy-web.sh [project-name]

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PROJECT="${1:-}"
if [ -z "$PROJECT" ] && [ -f "$ROOT/.web-demo-project" ]; then
  PROJECT="$(tr -d '[:space:]' < "$ROOT/.web-demo-project")"
fi
PROJECT="${PROJECT:-unolingo-spanish-learning-app}"
printf '%s\n' "$PROJECT" > "$ROOT/.web-demo-project"
URL="https://$PROJECT.vercel.app"

echo "==> Deploying $PROJECT from source (Vercel builds it with vercel.json)"
npx vercel link --yes --project "$PROJECT" >/dev/null
npx vercel deploy --prod --yes >/dev/null
echo "    deployed"

# --- Verify, because a green deploy is not a working one --------------------
# The deploy this replaced reported success in three seconds while serving 404
# on every route, including `/`. Status codes are checked here for that reason.
echo "==> Verifying $URL"
fail=0
check() {
  code="$(curl -s -o /dev/null -w '%{http_code}' "$URL$1")"
  printf '    %-28s %s\n' "$1" "$code"
  [ "$code" = "200" ] || fail=1
}

for route in / /library /practice /profile /progress /search /session /onboarding /mistakes; do
  check "$route"
done
# One per dynamic route: these resolve through a rewrite and are the ones that
# break invisibly, since client-side navigation never asks the server.
check "/word/v.casa"
check "/verb/ser"
check "/grammar/g.ser-estar"
check "/unit/unit.first-words"

# The icon font, which Vercel will not serve under its emitted path.
if [ -d "$ROOT/dist" ]; then
  FONT="$(grep -ohE "/assets/node_modules/[^\"']*Ionicons[^\"']*\.ttf" "$ROOT"/dist/_expo/static/js/web/*.js 2>/dev/null | head -1 || true)"
  [ -n "$FONT" ] && check "$FONT"
fi

if [ "$fail" -ne 0 ]; then
  echo ""
  echo "!!! Something is not serving. Check the build log:  npx vercel inspect --logs $URL" >&2
  exit 1
fi

echo ""
echo "==> Live and verified:  $URL"
