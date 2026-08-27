#!/usr/bin/env bash
#
# Build and deploy Unolingo's web build to Vercel.
#
# This exists rather than the generic `deploy_web_demo` skill because that
# skill's vercel.json knows nothing about **dynamic routes**, and this app has
# four of them. Expo's static export writes one file per route, so a dynamic
# route lands on disk as the literal `word/[id].html`. Nothing serves that at
# `/word/v.casa`: the SPA reaches it fine through client-side navigation, so it
# looks like it works right up until somebody refreshes a word page or opens a
# link somebody sent them — which is exactly what a shared demo is for.
#
# The rewrites are **derived from the export**, not listed here. A hardcoded
# list is a second place to remember when a route is added, and it rots
# silently: the app keeps working in the browser and only direct links break.
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

STAGE="$ROOT/.web-demo-deploy"

restore_env() { [ -f "$ROOT/.env.deploybak" ] && mv "$ROOT/.env.deploybak" "$ROOT/.env" || true; }
trap restore_env EXIT

# --- 1. Key-free web export -------------------------------------------------
# Anything named EXPO_PUBLIC_* is inlined into the client bundle at build time,
# so the export runs with .env moved aside. --clear because Metro caches the
# inlined module and a plain rebuild can still carry it.
echo "==> Building key-free web export  (project: $PROJECT)"
[ -f "$ROOT/.env" ] && mv "$ROOT/.env" "$ROOT/.env.deploybak"
rm -rf "$ROOT/dist"
npx expo export --platform web --clear

# --- 2. Refuse to ship secrets ---------------------------------------------
echo "==> Scanning bundle for leaked secrets"
leak=0
if grep -rqE 'sk-ant-[A-Za-z0-9]{6}|sk-[A-Za-z0-9]{24}|AIza[A-Za-z0-9_-]{20}|xox[baprs]-[A-Za-z0-9-]{10}' "$ROOT/dist"; then
  echo "!!! A known API-key pattern is present in dist/." >&2
  leak=1
fi
if [ -f "$ROOT/.env.deploybak" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in \#*|'') continue ;; esac
    key="${line%%=*}"; val="${line#*=}"
    val="$(printf '%s' "$val" | sed -E "s/^[[:space:]\"']+//; s/[[:space:]\"']+$//")"
    [ "${#val}" -lt 12 ] && continue
    if grep -rqF -- "$val" "$ROOT/dist"; then
      echo "!!! Value of $key leaked into the bundle." >&2
      leak=1
    fi
  done < "$ROOT/.env.deploybak"
fi
[ "$leak" -ne 0 ] && { echo "!!! ABORT: refusing to publish a bundle containing secrets." >&2; exit 1; }
echo "    clean — no secrets in dist/."

# --- 3. Stage, and fix the icon-font path ----------------------------------
# Expo emits the vector-icon fonts under assets/node_modules/..., and Vercel's
# uploader drops any directory named node_modules — so every Ionicon renders
# blank. Rename it and rewrite the bundle's hardcoded URLs back onto it.
echo "==> Staging deploy folder"
rm -rf "$STAGE"
cp -R "$ROOT/dist" "$STAGE"
[ -d "$STAGE/assets/node_modules" ] && mv "$STAGE/assets/node_modules" "$STAGE/assets/nm"

# --- 4. Derive one rewrite per dynamic route -------------------------------
# `cleanUrls` serves `word/[id].html` at `/word/[id]`, so the destination is the
# percent-encoded clean path. Pointing it at the .html instead lands on
# cleanUrls' own 308 and the rewrite never resolves — which is how this was
# first got wrong.
echo "==> Deriving dynamic-route rewrites"
ROUTES="$(cd "$STAGE" && find . -name '*.html' -path '*[[]*' | sed 's|^\./||')"
rewrites='    { "source": "/assets/node_modules/:path*", "destination": "/assets/nm/:path*" }'
while IFS= read -r page; do
  [ -z "$page" ] && continue
  dir="$(dirname "$page")"
  base="$(basename "$page" .html)"          # e.g. [id]
  param="$(printf '%s' "$base" | tr -d '[]')"
  enc="$(printf '%s' "$base" | sed 's/\[/%5B/g; s/\]/%5D/g')"
  echo "    /$dir/:$param  ->  /$dir/$enc"
  rewrites="$rewrites,
    { \"source\": \"/$dir/:$param\", \"destination\": \"/$dir/$enc\" }"
done <<< "$ROUTES"

cat > "$STAGE/vercel.json" <<JSON
{
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
$rewrites
  ]
}
JSON

# --- 5. Deploy --------------------------------------------------------------
echo "==> Deploying to Vercel (production)"
cd "$STAGE"
npx vercel projects add "$PROJECT" >/dev/null 2>&1 || true
npx vercel link --yes --project "$PROJECT" >/dev/null
npx vercel deploy --prod --yes >/dev/null

echo ""
echo "==> Done.  Live: https://$PROJECT.vercel.app"
