ARG ALPINE_RELEASE
FROM wener/base:${ALPINE_RELEASE}
ARG VERSION
ARG TARGETARCH

RUN --mount=type=cache,target=/tmp \
    set -ex \
    && cd /tmp \
    && curl -sfLOC- "https://github.com/juicedata/juicefs/releases/download/v${VERSION}/juicefs-${VERSION}-linux-${TARGETARCH}.tar.gz" \
    && tar -zxf juicefs-${VERSION}-linux-${TARGETARCH}.tar.gz \
    && ls juicefs* \
    && install juicefs /usr/bin/juicefs

ENTRYPOINT ["/usr/bin/juicefs", "mount"]
