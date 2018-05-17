FROM       debian

LABEL maintainer="wener@wener.me"\
    org.label-schema.name="debian" \
    org.label-schema.vendor="Wener" \
    org.label-schema.description="Debian with Chinese mirror" \
    org.label-schema.url="https://github.com/wenerme/dockerfiles" \
    org.label-schema.vcs-url="https://github.com/wenerme/dockerfiles" \
    org.label-schema.version="3.7" \
    org.label-schema.license="MIT"

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
