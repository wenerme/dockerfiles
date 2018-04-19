#!/bin/sh
set -e

if echo "$1" | grep -E "^-" ; then
  smbd "$@"
elif [ $# = 0 ] ; then
  # Foreground, Log to stdout
  smbd -FS
else
  "$@"
fi
