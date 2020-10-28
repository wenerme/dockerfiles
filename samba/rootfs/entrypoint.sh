#!/bin/sh
set -e

: "${SHARE_NAME:=Public}"
: "${SAMBA_USER:=}"
: "${SAMBA_PASSWORD:=}"

if echo "$1" | grep -E "^-" ; then
  smbd "$@"
elif [ $# = 0 ] ; then
  # Foreground, Log to stdout
  smbd -FS
else
  "$@"
fi
