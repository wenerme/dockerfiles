#!/bin/bash
{ [ -f .build/init.sh ] && . .build/init.sh; } || true;
{ [ -f ../.build/init.sh ] && . ../.build/init.sh; } || true;
buildreport || exit

builddocker_init_ver clash
vers=${1:-clash}
builddocker_vers ${vers}

ver=$(docker run --rm -it wener/clash clash -v | grep -Eo 'v[0-9.]+' | grep -Eo '[0-9.]+')
echo $ver ${ver%.*} ${ver%.*.*} | xargs -n 1 crane tag wener/clash
