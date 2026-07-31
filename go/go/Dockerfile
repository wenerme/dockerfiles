ARG ALPINE_RELEASE=3.24.1
FROM wener/base:${ALPINE_RELEASE}

ARG GO_PACKAGE_VERSION=1.26.3-r0
ARG TARGETARCH
ARG TARGETVARIANT
RUN --mount=type=cache,id=apk-$TARGETARCH$TARGETVARIANT,sharing=locked,target=/etc/apk/cache \
  apk add --no-cache go=${GO_PACKAGE_VERSION} musl-dev git make gcc pkgconf
RUN mkdir -p /root/go
