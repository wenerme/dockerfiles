FROM wener/base
ARG VERSION
ARG TARGETARCH

# https://github.com/MetaCubeX/mihomo/releases/download/v1.17.0/mihomo-linux-amd64-compatible-v1.17.0.gz
RUN --mount=type=cache,target=/tmp \
    set -ex \
    && cd /tmp \
    && curl -sfLOC- https://github.com/MetaCubeX/mihomo/releases/download/v${VERSION}/mihomo-linux-${TARGETARCH}-v${VERSION}.gz \
    && apk add 7zip \
    && setup-timezone Asia/Shanghai \
    && 7z x mihomo-linux-${TARGETARCH}-v${VERSION}.gz \
    && ls mihomo-linux-${TARGETARCH}* \
    && [ ! -e mihomo-linux-${TARGETARCH} ] || mv mihomo-linux-${TARGETARCH} /usr/bin/mihomo \
    && [ ! -e mihomo-linux-${TARGETARCH}-v${VERSION} ] || mv mihomo-linux-${TARGETARCH}-v${VERSION} /usr/bin/mihomo \
    && chmod +x /usr/bin/mihomo \
    && file /usr/bin/mihomo
# This program can only be run on AMD64 processors with v3 microarchitecture support.
#    && mihomo -v

CMD ["/usr/bin/mihomo"]
