#!/bin/bash
{ [ -f .build/init.sh ] && . .build/init.sh; } || true;
{ [ -f ../.build/init.sh ] && . ../.build/init.sh; } || true;
buildreport || exit

builddocker_init_ver gitlab-runner
vers=${1:-gitlab-runner dev}
builddocker_vers $vers

ver=`docker run wener/gitlab-runner gitlab-runner -v | head -1 | grep -Eo '[0-9.]+'`
echo $ver ${ver%.*} ${ver%.*.*} | xargs -n 1 crane tag wener/gitlab-runner
echo {$ver,${ver%.*},${ver%.*.*}}-dev | xargs -n 1 crane tag wener/gitlab-runner:dev
