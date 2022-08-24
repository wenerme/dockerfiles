#!/bin/bash
{ [ -f .build/init.sh ] && . .build/init.sh; } || true;
{ [ -f ../.build/init.sh ] && . ../.build/init.sh; } || true;
buildreport || exit

builddocker_init_ver go
vers=${1:-"go win"}
builddocker_vers $vers

ver=v$(docker run --rm -it wener/go go version | grep -E -o '[0-9]+[.][0-9]+' | tr -d '[:space:]' )

docker tag wener/go $DOCKER_REGISTRY/$GROUP/go:$ver
docker push $DOCKER_REGISTRY/$GROUP/go:$ver
