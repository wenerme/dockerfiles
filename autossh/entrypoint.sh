#!/bin/sh
set -e

if [ "$1" == "ssh"* ]; then
    # Handle ssh command
    "$@"
else
    eval sshpass -e -v ssh $SSH_COMMANDS $*
fi
