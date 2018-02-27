FROM       debian
MAINTAINER wener

RUN DEBIAN_MIRROR=http://mirrors.aliyun.com/ &&\
    DISTRIB_CODENAME=$(sed -nr 's/VERSION.*\((.*)\).*/\1/p' /etc/os-release) && \
        echo "# Use Aliyun ubuntu mirror                                                                            \n\
deb $DEBIAN_MIRROR/debian/               $DISTRIB_CODENAME main non-free contrib                     \n\
deb $DEBIAN_MIRROR/debian/               $DISTRIB_CODENAME-proposed-updates main non-free contrib    \n\
deb $DEBIAN_MIRROR/debian-security/      $DISTRIB_CODENAME/updates main non-free contrib             \n\
deb-src $DEBIAN_MIRROR/debian/           $DISTRIB_CODENAME main non-free contrib                     \n\
deb-src $DEBIAN_MIRROR/debian/           $DISTRIB_CODENAME-proposed-updates main non-free contrib    \n\
deb-src $DEBIAN_MIRROR/debian-security/  $DISTRIB_CODENAME/updates main non-free contrib             \n\
" > /etc/apt/sources.list
