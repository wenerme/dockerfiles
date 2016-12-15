#!/bin/sh
set -e
set -o xtrace

eval sshpass -e -v ssh $SSH_COMMANDS $*
