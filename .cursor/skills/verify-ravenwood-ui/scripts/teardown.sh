#!/usr/bin/env bash
# Stops only processes this skill started (.verify/pid and .verify/scratch.pid process groups).
# Never touches the artifact directory.
cd "${1:-.}"
for f in .verify/pid .verify/scratch.pid; do p=$(cat $f 2>/dev/null) || continue; kill -- -"$p" 2>/dev/null || kill "$p" 2>/dev/null; rm -f $f; echo "stopped $p ($f)"; done
s=$(cat .verify/scratch.dir 2>/dev/null) && [[ "$(basename "$s")" == rui-scratch-* && -d "$s" ]] && rm -rf "$s" .verify/scratch.dir && echo "removed scratch app $s"
true
