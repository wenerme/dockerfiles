#!/bin/sh
set -e
set -o xtrace

# registry.cn-hangzhou.aliyuncs.com
# registry.wener.me
DOCKER_REGISTRY=${DOCKER_REGISTRY:-docker.io}
GROUP=${GROUP:-wener}
NAME=caddy
[ "`basename $PWD`" == "$NAME" ] || cd $NAME
names=${1:-base full dns php}
for ver in $names; do
    REPO=$GROUP/$NAME:$ver
    docker build -t $REPO -f $ver/Dockerfile .
done

if [ -z "$SKIP_PUSH" ]; then

for ver in $names; do
    REPO=$GROUP/$NAME:$ver

    [ "`docker images $REPO --format '{{.ID}}' | head -n1`" != "`docker images $DOCKER_REGISTRY/$REPO --format '{{.ID}}' | head -n1`" ] && {
        docker tag $REPO $DOCKER_REGISTRY/$REPO
        docker push $DOCKER_REGISTRY/$REPO
    } || {
        echo $REPO $BUILD_VERSION unchanged
    }
done

fi
