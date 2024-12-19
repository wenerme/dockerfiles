ARG ALPINE_RELEASE
FROM wener/app:${ALPINE_RELEASE}-ssh

RUN apk add --no-cache  \
    git make openssh jq file curl ca-certificates \
    docker docker-cli-buildx \
    libstdc++ libgcc alpine-sdk musl-dev gcc pkgconf

RUN docker buildx use default  \
    && docker buildx install

# by Languages
# golang
RUN apk add --no-cache go

# nodejs
ENV N_NODE_MIRROR=https://npmmirror.com/mirrors/node-unofficial-builds
RUN curl -L https://raw.githubusercontent.com/tj/n/master/bin/n | bash -s -- --arch x64-musl lts
RUN npm config set registry https://registry.npmmirror.com
RUN npm add -g n pnpm && npm cache clean --force

COPY rootfs /
