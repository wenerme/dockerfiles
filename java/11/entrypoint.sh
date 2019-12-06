#!/bin/bash
set -e

if echo "$1" | grep -E "^-" ; then
  java "$@"
elif [ $# = 0 ] ; then
  # Foreground, Log to stdout
  java -jar app.jar
else
  "$@"
fi
