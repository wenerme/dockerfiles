ARG VERSION
ARG TARGETARCH
ARG TARGETVARIANT

FROM wener/go:$VERSION
RUN --mount=type=cache,id=apk-$TARGETARCH$TARGETVARIANT,sharing=locked,target=/etc/apk/cache \
    apk add --no-cache mingw-w64-gcc wine
