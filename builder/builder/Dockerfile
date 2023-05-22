FROM wener/base

# let pkgs='rsync rclone alpine-sdk bash binutils ca-certificates coreutils curl docker docker-cli-buildx dumb-init file findutils g++ gcc gcompat git grep jq libc6-compat libgcc libstdc++ linux-headers make musl-dev ncurses nodejs npm openssh openssl pkgconf python3 sed tini util-linux yarn yq go'; copy(Array.from(new Set(pkgs.split(/\s+/))).sort().join(' '))
RUN apk add --no-cache alpine-sdk bash binutils ca-certificates coreutils curl docker docker-cli-buildx dumb-init file findutils g++ gcc gcompat git go grep jq libc6-compat libgcc libstdc++ linux-headers make musl-dev ncurses nodejs npm openssh openssl pkgconf python3 rclone rsync sed tini util-linux yarn yq

# nodejs
ENV N_NODE_MIRROR=https://npmmirror.com/mirrors/node-unofficial-builds
RUN curl -L https://raw.githubusercontent.com/tj/n/master/bin/n | bash -s -- --arch x64-musl lts
RUN npm config set registry https://registry.npmmirror.com
RUN npm add -g n pnpm && npm cache clean --force

# COPY rootfs /
