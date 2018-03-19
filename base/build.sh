#!/bin/bash
{ [ -f .build/init.sh ] && . .build/init.sh; } || true;
{ [ -f ../.build/init.sh ] && . ../.build/init.sh; } || true;
buildreport || exit

builddocker_init_ver base
vers=${1:-"base bash"}
vers_all="base bash util builder svc sys man arm"
BUILD_ALL && vers="$vers_all"

builddocker_vers $vers
