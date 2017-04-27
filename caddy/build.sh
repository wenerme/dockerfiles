#!/bin/bash
{ [ -f .build/init.sh ] && . .build/init.sh; } || true;
{ [ -f ../.build/init.sh ] && . ../.build/init.sh; } || true;
buildreport || exit

builddocker_init_ver caddy
vers=${1:-caddy full dns php}
BUILD_IN_PARENT=true builddocker_vers ${vers}
