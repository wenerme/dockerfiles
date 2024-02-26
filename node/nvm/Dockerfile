ARG ALPINE_RELEASE
FROM wener/base:${ALPINE_RELEASE}

ARG TARGETARCH
ARG TARGETVARIANT
RUN --mount=type=cache,id=apk-$TARGETARCH$TARGETVARIANT,sharing=locked,target=/etc/apk/cache \
    apk add sudo \
    # admin account - disable login but enable sudo
    && adduser -D admin \
    # NOPASSWORD
    && echo 'admin ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers \
    # unlock user - use same ts to prevent unneed change
    && sed -i -re 's/^admin:.:\d+/admin:*:18000/' /etc/shadow \
    && cp /root/.bashrc ~admin/ && chown admin:admin ~admin/.bashrc \
    # https://github.com/nvm-sh/nvm#installing-nvm-on-alpine-linux
    # alpine requirement - build from source
    && apk add libc6-compat gcompat curl bash ca-certificates openssl ncurses coreutils python3 make gcc g++ libgcc linux-headers grep util-linux binutils findutils

USER admin

# install nvm for non root
RUN curl -f -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
# install lts from source
RUN --mount=type=cache,uid=1000,gid=1000,target=/home/admin/.nvm/.cache/ \
    export NVM_NODEJS_ORG_MIRROR=https://unofficial-builds.nodejs.org/download/release \
    && source ~/.bashrc  \
    && nvm install -s --lts  \
    && nvm use --lts \
    && nvm alias default stable

# use for root
# https://github.com/nvm-sh/nvm/issues/43#issuecomment-139739406
