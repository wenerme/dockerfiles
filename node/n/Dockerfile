ARG ALPINE_RELEASE
FROM wener/base:${ALPINE_RELEASE}

RUN --mount=type=cache,id=apk-$TARGETARCH$TARGETVARIANT,sharing=locked,target=/etc/apk/cache \
    apk add libstdc++ libgcc make

# install for root
RUN curl -fsSL -o /usr/local/bin/n https://raw.githubusercontent.com/tj/n/master/bin/n \
    && chmod +x /usr/local/bin/n

ARG VERSION
RUN N_NODE_MIRROR=https://unofficial-builds.nodejs.org/download/release n --arch x64-musl i ${VERSION}

RUN --mount=type=cache,target=/root/.npm/ \
    npm install -g npm pnpm yarn
