#!/bin/bash
set -e

if echo "$1" | grep -E "^-" ; then
  pdns_server "$@"
elif [ $# = 0 ] ; then
  pdns_server --daemon=no
else
  "$@"
fi
