#!/bin/bash
{ [ -f .build/init.sh ] && . .build/init.sh; } || true;
{ [ -f ../.build/init.sh ] && . ../.build/init.sh; } || true;
buildreport || exit

names=${1:-"base nginx java node autossh piwik pdns nmap tinyproxy"}
builddocker_dirs $names

