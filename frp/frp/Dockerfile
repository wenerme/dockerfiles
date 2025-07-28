ARG ALPINE_RELEASE
FROM wener/base:${ALPINE_RELEASE}

# https://github.com/fatedier/frp/releases
ARG VERSION
ARG TARGETARCH

# inotify-tools help auto reload frp
# TARGETARCH amd64
RUN apk add --no-cache inotify-tools
RUN test -n "$VERSION" \
    && apk add frp  \
    && echo Building ${VERSION} \
    && curl -LO https://github.com/fatedier/frp/releases/download/v${VERSION}/frp_${VERSION}_linux_${TARGETARCH}.tar.gz \
    && tar -zxvf frp_${VERSION}_linux_${TARGETARCH}.tar.gz \
    && mv frp_${VERSION}_linux_${TARGETARCH}/frps frp_${VERSION}_linux_${TARGETARCH}/frpc /usr/bin/ \
    && rm -rf frp_${VERSION}_linux_${TARGETARCH}*
