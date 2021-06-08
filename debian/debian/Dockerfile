FROM debian:buster-backports

LABEL org.label-schema.name="debian" \
    org.label-schema.vendor="Wener" \
    org.label-schema.description="Debian with China mirror" \
    org.label-schema.url="https://github.com/wenerme/dockerfiles" \
    org.label-schema.vcs-url="https://github.com/wenerme/dockerfiles" \
    org.label-schema.license="MIT"

ENV VERSION_CODENAME=buster
ENV DEBIAN_MIRROR=http://mirrors.aliyun.com
RUN echo "# China mirror                                                                         \n\
deb $DEBIAN_MIRROR/debian/               $VERSION_CODENAME main non-free contrib                     \n\
deb $DEBIAN_MIRROR/debian/               $VERSION_CODENAME-proposed-updates main non-free contrib    \n\
deb $DEBIAN_MIRROR/debian-security/      $VERSION_CODENAME/updates main non-free contrib             \n\
deb-src $DEBIAN_MIRROR/debian/           $VERSION_CODENAME main non-free contrib                     \n\
deb-src $DEBIAN_MIRROR/debian/           $VERSION_CODENAME-proposed-updates main non-free contrib    \n\
deb-src $DEBIAN_MIRROR/debian-security/  $VERSION_CODENAME/updates main non-free contrib             \n\
" > /etc/apt/sources.list \
  && echo "deb http://mirrors.aliyun.com/debian $VERSION_CODENAME-backports main" > /etc/apt/sources.list.d/backports.list

# debian is not small anyway
RUN apt update && apt upgrade -y && apt install -t buster-backports -y \
  # utils
  ca-certificates util-linux tree file nano htop procps \
  && rm -rf /var/lib/apt/lists/*
