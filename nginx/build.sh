#!/bin/bash
{ [ -f .build/init.sh ] && . .build/init.sh; } || true;
{ [ -f ../.build/init.sh ] && . ../.build/init.sh; } || true;
buildreport || exit

builddocker_init_ver nginx
vers=${1:-"nginx bash"}
vers_all=${1:-"$vers stream full"}
[ "$BUILD_ALL" != "" ] && vers="$vers_all"

builddocker_vers $vers
