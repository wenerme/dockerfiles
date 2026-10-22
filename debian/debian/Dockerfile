ARG VERSION=13.7
FROM debian:${VERSION}

ARG DEBIAN_MIRROR=https://mirrors.tuna.tsinghua.edu.cn

LABEL org.opencontainers.image.description="Debian with a China apt mirror and backports enabled"

# Install and upgrade from deb.debian.org, which is fast on any builder, then point apt at the China mirror
# for users of the image. Backports are added so `apt install -t <codename>-backports` works.
RUN set -eux; \
    . /etc/os-release; \
    apt-get update; \
    apt-get upgrade -y; \
    apt-get install -y --no-install-recommends \
      ca-certificates curl wget file htop nano procps tree util-linux; \
    rm -rf /var/lib/apt/lists/*; \
    sed -i \
      -e "s#http://deb.debian.org#${DEBIAN_MIRROR}#g" \
      -e "s#^Suites: ${VERSION_CODENAME} ${VERSION_CODENAME}-updates\$#Suites: ${VERSION_CODENAME} ${VERSION_CODENAME}-updates ${VERSION_CODENAME}-backports#" \
      /etc/apt/sources.list.d/debian.sources; \
    grep -q "${DEBIAN_MIRROR}/debian-security" /etc/apt/sources.list.d/debian.sources; \
    grep -q "${VERSION_CODENAME}-backports" /etc/apt/sources.list.d/debian.sources
