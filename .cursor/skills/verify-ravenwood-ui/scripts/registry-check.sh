#!/usr/bin/env bash
# GET every registry item locally (/r/<name>.json) and from the live registry.
# Usage: registry-check.sh <local-base> [live-base=https://ui.ravenwoodsoftware.dev]
L="${1:?local base}"; R="${2:-https://ui.ravenwoodsoftware.dev}"; rc=0
[ -f registry.json ] || { echo "run from the repo root (registry.json not found)"; exit 2; }
names=$(python3 -c "import json;print(' '.join(i['name'] for i in json.load(open('registry.json'))['items']))")
for base in "$L" "$R"; do n=0; bad=0
  for name in registry $names; do
    body=$(curl -fs --max-time 20 "$base/r/$name.json") && echo "$body" | python3 -c "import json,sys;d=json.load(sys.stdin);n='$name';assert (n=='registry' and d.get('items')) or (d.get('name')==n and d.get('type','').startswith('registry:') and (d.get('files') or d.get('cssVars') or d.get('font') or d.get('css') or d.get('registryDependencies')))" 2>/dev/null \
      && n=$((n+1)) || { echo "FAIL  $base/r/$name.json"; bad=$((bad+1)); }
  done
  echo "$([ $bad = 0 ] && echo PASS || echo FAIL)  registry items @ $base: $n ok, $bad bad"; [ $bad = 0 ] || rc=1
done
c=$(curl -s -o /dev/null -w '%{http_code}' "$L/r/does-not-exist.json"); echo "$([ $c = 404 ] && echo PASS || echo FAIL)  unknown item -> $c (want 404)"; [ $c = 404 ] || rc=1
c=$(curl -s -o /dev/null -w '%{http_code}' "$L/r/..%2Fpackage.json"); echo "$([ $c = 404 ] && echo PASS || echo FAIL)  path traversal -> $c (want 404)"; [ $c = 404 ] || rc=1
exit $rc
