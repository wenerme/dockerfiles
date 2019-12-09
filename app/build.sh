#!/bin/bash
{ [ -f .build/init.sh ] && . .build/init.sh; } || true;
{ [ -f ../.build/init.sh ] && . ../.build/init.sh; } || true;
buildreport || exit

builddocker_init_ver app
# By default not build base, because base will always build no matter it changed or not
vers=${@:-"app builder dns"}
[ "$BUILD_ALL" != "" ] && vers="$vers_all"

builddocker_vers $vers
