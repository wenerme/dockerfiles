#!/bin/bash
{ [ -f .build/init.sh ] && . .build/init.sh; } || true;
{ [ -f ../.build/init.sh ] && . ../.build/init.sh; } || true;
buildreport || exit

builddocker_init_ver frp
vers=${1:-frp frps frpc}
builddocker_vers $vers

ver=v$(docker run --rm -it wener/frp frps -v | tr -d '[:space:]')
docker tag wener/frp:frps wener/frp:$ver
docker tag wener/frp:frps wener/frps:$ver
docker tag wener/frp:frpc wener/frpc:$ver
docker push wener/frp:$ver
docker push wener/frps:$ver
docker push wener/frpc:$ver
