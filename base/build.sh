#!/bin/bash
{ [ -f .build/init.sh ] && . .build/init.sh; } || true
{ [ -f ../.build/init.sh ] && . ../.build/init.sh; } || true
buildreport || exit

builddocker_init_ver base
# By default not build base, because base will always build no matter it changed or not
vers=${@:-"bash openrc app"}
# vers_all="bash util builder svc sys man armhf aarch64 s390x ppc64le x86"
vers_all="bash openrc util builder svc sys man armhf aarch64 s390x x86"
[ "$BUILD_ALL" != "" ] && vers="$vers_all"

builddocker_vers $vers

ver=v$(docker run --rm -it wener/base sh -c '. /etc/os-release; echo -n $VERSION_ID')
ver_short=${ver%.*}
ver_major=${ver_short%.*}

[[ $vers =~ "base" ]] && {
  for v in $ver $ver_short $ver_major; do
    docker tag wener/base $DOCKER_REGISTRY/$GROUP/base:"$v"
    docker push $DOCKER_REGISTRY/$GROUP/base:"$v"
  done
}
