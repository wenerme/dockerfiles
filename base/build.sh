#!/bin/bash
{ [ -f .build/init.sh ] && . .build/init.sh; } || true;
{ [ -f ../.build/init.sh ] && . ../.build/init.sh; } || true;
buildreport || exit

builddocker_init_ver base
# By default not build base, because base will always build no matter it changed or not
vers=${@:-"bash openrc"}
# vers_all="bash util builder svc sys man armhf aarch64 s390x ppc64le x86"
vers_all="bash openrc util builder svc sys man armhf aarch64 s390x x86"
[ "$BUILD_ALL" != "" ] && vers="$vers_all"

builddocker_vers $vers
