#!/bin/sh
set -e

if echo "$1" | grep "^sh" ; then
    # Handle command
    "$@"
else
    sockd -V
    sockd
fi
