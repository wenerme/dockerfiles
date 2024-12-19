ARG ALPINE_RELEASE
FROM wener/base:${ALPINE_RELEASE}
ARG VERSION
ARG TARGETARCH

# https://github.com/MetaCubeX/mihomo/releases/download/v1.17.0/mihomo-linux-amd64-compatible-v1.17.0.gz
RUN --mount=type=cache,target=/tmp \
    set -ex \
    && cd /tmp \
    && curl -sfLOC- https://github.com/MetaCubeX/mihomo/releases/download/v${VERSION}/mihomo-linux-${TARGETARCH}-compatible-v${VERSION}.gz \
    && apk add 7zip \
    && setup-timezone Asia/Shanghai \
    && 7z x mihomo-linux-${TARGETARCH}-compatible-v${VERSION}.gz \
    && ls mihomo-linux-${TARGETARCH}* \
    && [ ! -e mihomo-linux-${TARGETARCH}-compatible ] || mv mihomo-linux-${TARGETARCH}-compatible /usr/bin/mihomo \
    && [ ! -e mihomo-linux-${TARGETARCH}-compatible-v${VERSION} ] || mv mihomo-linux-${TARGETARCH}-compatible-v${VERSION} /usr/bin/mihomo \
    && chmod +x /usr/bin/mihomo \
    && mihomo -v

CMD ["/usr/bin/mihomo"]
