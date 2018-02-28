#!/bin/sh
set -e

# Allowed tincd/tinc command
if echo "$1" | grep -Eq '^(tinc|sh)'; then
    "$@"
else
    tincd -D -d 3 $*
fi
