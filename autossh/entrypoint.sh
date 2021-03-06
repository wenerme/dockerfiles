#!/bin/sh
set -e

if echo "$1" | grep "^ssh" ; then
    # Handle ssh command
    "$@"
else
    eval sshpass -e -v ssh $SSH_COMMANDS $*
fi
