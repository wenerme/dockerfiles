#!/bin/bash
{ [ -f .build/init.sh ] && . .build/init.sh; } || true;
{ [ -f ../.build/init.sh ] && . ../.build/init.sh; } || true;
buildreport || exit

builddocker_init_ver node
vers=${1:-"node"}

builddocker_vers $vers

ver=$(docker run --rm -it wener/node node -v | tr -d '\r\n')
ver_short=${ver%.*}
ver_major=${ver_short%.*}

[[ $vers =~ "node" ]] && {
  for v in $ver $ver_short $ver_major; do
    docker tag wener/node $DOCKER_REGISTRY/$GROUP/node:"$v"
    docker push $DOCKER_REGISTRY/$GROUP/node:"$v"
  done
}
