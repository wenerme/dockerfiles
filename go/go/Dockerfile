ARG ALPINE_RELEASE
FROM wener/base:${ALPINE_RELEASE}

ARG TARGETARCH
ARG TARGETVARIANT
RUN --mount=type=cache,id=apk-$TARGETARCH$TARGETVARIANT,sharing=locked,target=/etc/apk/cache \
  apk add --no-cache go musl-dev git make gcc pkgconf
RUN mkdir /root/go
