#!/bin/sh
set -e
[ -z "$VERBOSE" ] || set -o xtrace

echo Load build init script
builddocker(){
    echo Trying to build;
}

command -v git > /dev/null || {
echo "NOTE: Git not found"
alias git="echo Git Not Found:"
}
BRANCH=${BRANCH:-`git rev-parse --abbrev-ref HEAD`}
COMMIT=${COMMIT:-`git log --pretty=format:'%h' -n 1`}
COMMENT=${COMMENT:-`git log -1 --pretty=%B | tr '\n' ' '`}

# registry.cn-hangzhou.aliyuncs.com
# registry.wener.me
DOCKER_REGISTRY=${DOCKER_REGISTRY:-docker.io}
GROUP=${GROUP:-wener}

buildreport(){
    echo "Building `date +"%Y%m%d%H%M"` ${BRANCH}@${COMMIT} : ${COMMENT}"
}

builddocker_dirs(){
local names="$@"
echo "Building docker dir: $names"
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
}

builddocker_vers(){
local NAME="`basename $PWD`"
local names="$@"
echo "Building docker versions: $names"
for ver in $names; do
    if [ "$ver" = "$NAME" ]; then
    REPO=$GROUP/$NAME
    else
    REPO=$GROUP/$NAME:$ver
    fi

    docker build -t $REPO -f $ver/Dockerfile .
done

if [ -z "$SKIP_PUSH" ]; then

for ver in $names; do
    if [ "$ver" = "$NAME" ]; then
    REPO=$GROUP/$NAME
    else
    REPO=$GROUP/$NAME:$ver
    fi

    [ "`docker images $REPO --format '{{.ID}}' | head -n1`" != "`docker images $DOCKER_REGISTRY/$REPO --format '{{.ID}}' | head -n1`" ] && {
        docker tag $REPO $DOCKER_REGISTRY/$REPO
        docker push $DOCKER_REGISTRY/$REPO
    } || {
        echo $REPO unchanged
    }
done

fi
}

builddocker_init_ver(){
NAME=$1
[ "`basename $PWD`" == "$NAME" ] || cd $NAME
}
