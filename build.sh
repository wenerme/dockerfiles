#!/bin/sh
set -e
set -o xtrace

export BRANCH=${BRANCH:-`git rev-parse --abbrev-ref HEAD`}
export COMMIT=${COMMIT:-`git log --pretty=format:'%h' -n 1`}
export COMMENT=${COMMENT:-`command -v git > /dev/null && git log -1 --pretty=%B | tr '\n' ' ' || echo 'No git command'`}

# registry.cn-hangzhou.aliyuncs.com
# registry.wener.me
DOCKER_REGISTRY=${DOCKER_REGISTRY:-docker.io}
GROUP=${GROUP:-wener}

echo Build at `date +"%Y%m%d%H%M"`- $BRANCH $COMMIT
echo "\t$COMMENT"
names=${1:-"base edge ubuntu nginx java node builder autossh zentao caddy pdns"}
for name in $names;
do
    REPO=$GROUP/$name
    echo Buiding $REPO

    if [ -f "$name/build.sh" ];
    then
        $name/build.sh
    else
        docker build -t $REPO $name
    fi

done

if [ -z "$SKIP_PUSH" ]; then

for name in $names;
do
    REPO=$GROUP/$name
    echo Pushing $REPO
    # 只有在没有 build.sh 且镜像内容发生了改变时才推送
    [ -f "$name/build.sh" ] || [ "`docker images $REPO --format '{{.ID}}' | head -n1`" != "`docker images $DOCKER_REGISTRY/$REPO --format '{{.ID}}' | head -n1`" ] && {
#        docker tag $REPO $DOCKER_REGISTRY/$REPO:$BUILD_VERSION
#        docker push $DOCKER_REGISTRY/$REPO:$BUILD_VERSION
        docker tag $REPO $DOCKER_REGISTRY/$REPO
        docker push $DOCKER_REGISTRY/$REPO
    } || {
        echo $REPO unchanged
    }
done

fi
