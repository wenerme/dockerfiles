#!/bin/sh
{ [ -f .build/init.sh ] && . .build/init.sh; } || true;
{ [ -f ../.build/init.sh ] && . ../.build/init.sh; } || true;
buildreport || exit

names=${1:-"base edge ubuntu nginx java node builder autossh zentao caddy pdns nmap"}
builddocker_dirs $names

