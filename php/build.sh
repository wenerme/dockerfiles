#!/bin/bash
{ [ -f .build/init.sh ] && . .build/init.sh; } || true;
{ [ -f ../.build/init.sh ] && . ../.build/init.sh; } || true;
buildreport || exit

builddocker_init_ver php
BUILD_IN_PARENT=1
vers=${1:-"5 7 php pecl composer"}
builddocker_vers $vers
