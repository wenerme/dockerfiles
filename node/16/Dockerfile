ARG ALPINE_RELEASE=3.18
FROM wener/base:${ALPINE_RELEASE}

ARG NODE_VERSION=16
RUN --mount=type=cache,target=/etc/apk/cache \
    apk add libstdc++ libgcc \
    && curl -sfL https://ghproxy.com/https://raw.githubusercontent.com/tj/n/master/bin/n -o /usr/local/bin/n \
    && chmod +x /usr/local/bin/n \
    && N_NODE_MIRROR=https://npmmirror.com/mirrors/node-unofficial-builds n --arch x64-musl $NODE_VERSION \
    && n rm $NODE_VERSION
