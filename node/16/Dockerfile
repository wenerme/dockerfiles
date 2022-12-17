FROM wener/base

RUN --mount=type=cache,target=/etc/apk/cache \
    apk add libstdc++ libgcc \
    && curl -sfL https://ghproxy.com/https://raw.githubusercontent.com/tj/n/master/bin/n -o /usr/local/bin/n \
    && chmod +x /usr/local/bin/n \
    && N_NODE_MIRROR=https://npmmirror.com/mirrors/node-unofficial-builds n --arch x64-musl 16 \
    && n rm 16
