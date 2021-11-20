#!/bin/bash
{ [ -f .build/init.sh ] && . .build/init.sh; } || true;
{ [ -f ../.build/init.sh ] && . ../.build/init.sh; } || true;
buildreport || exit

builddocker_init_ver frp
vers=${1:-frp frps frpc}
builddocker_vers $vers

ver=v$(docker run --rm -it wener/frp frps -v | tr -d '[:space:]')
docker tag wener/frp:frps $DOCKER_REGISTRY/$GROUP/frp:$ver
docker tag wener/frp:frps $DOCKER_REGISTRY/$GROUP/frps:$ver
docker tag wener/frp:frpc $DOCKER_REGISTRY/$GROUP/frpc:$ver
docker push $DOCKER_REGISTRY/$GROUP/frp:$ver
docker push $DOCKER_REGISTRY/$GROUP/frps:$ver
docker push $DOCKER_REGISTRY/$GROUP/frpc:$ver
