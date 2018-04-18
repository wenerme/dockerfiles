#!/bin/bash
{ [ -f .build/init.sh ] && . .build/init.sh; } || true;
{ [ -f ../.build/init.sh ] && . ../.build/init.sh; } || true;
buildreport || exit

builddocker_init_ver pdns

BUILD_IN_PARENT=1
vers=${1:-"pdns edge"}
builddocker_vers $vers
